import * as eio from "engine.io-client";
import { v4 as uuidv4 } from "uuid";
import { assert } from "./assert";
import { type auth_state } from "./auth-state";

export type credentials =
  | { username: string; password: string }
  | { user_id: string; password: string };

type signup_params = {
  email: string;
  username: string;
  realname: string;
  password: string;
};

type reset_password_params = {
  code: string;
  password: string;
  username: string;
};

export type command_status_type = "queued" | "succeeded" | "failed" | "aborted";

type object_state =
  | { type: "fetching" }
  | {
      type: "fetched";
      t: number;
      i: number;
      data: any;
    }
  | {
      type: "stale";
      t: number;
      i: number;
      data: any;
    };

export type broker_state = {
  connected: boolean;
  log_in_status: "logged_in" | "logging_in" | "idle";
  commands: { [command_uuid: string]: command_status_type };
  objects: { [type: string]: { [id: string]: object_state } };
  auth_state: auth_state;
};

export const initial_broker_state: broker_state = {
  connected: false,
  log_in_status: "idle",
  commands: {},
  objects: {},
  auth_state: { type: "idle" },
};

type command_form = {
  command_uuid: string;
  command_type: string;
  command_data: any;
};

type message =
  //| { type: "session"; session_id: string }
  | ({ type: "command" } & command_form)
  | { type: "fetch"; object_type: string; object_id: string }
  | {
      type: "register";
      email: string;
      password: string;
      username: string;
      realname: string;
      user_id: string;
      command_uuid: string;
    }
  | ({ type: "sign_in" } & credentials)
  | { type: "sign_out" }
  | {
      type: "reset_password";
      command_uuid: string;
      code: string;
      password: string;
    }
  | { type: "syn"; i: number };

type broker_constructor_params = {
  url: string;
  set_state: (state: broker_state) => void;
  set_credentials: (credentials: saved_credentials | undefined) => void;
  get_credentials: () => credentials | undefined;
};

type saved_credentials = { user_id: string; password: string };

export class Broker {
  private url: string;
  private session_id: string = uuidv4();
  private connection: eio.Socket | undefined;
  private reconnect = true;
  private message_queue: message[] = [];
  private sent_messages: message[] = [];
  private syn = 0;
  private state: broker_state = initial_broker_state;
  private on_state_change: (state: broker_state) => void;
  private command_callbacks: { [command_uuid: string]: () => void } = {};
  private set_credentials: (credentials: saved_credentials | undefined) => void;
  private get_credentials: () => credentials | undefined;

  constructor({
    url,
    set_state,
    get_credentials,
    set_credentials,
  }: broker_constructor_params) {
    this.url = url;
    this.get_credentials = get_credentials;
    this.set_credentials = set_credentials;
    this.on_state_change = set_state;
    this.keep_connection();
  }

  public terminate() {
    this.reconnect = false;
    this.connection?.close();
    this.connection = undefined;
  }

  private send(message: message) {
    if (this.message_queue.length === 0) {
      setTimeout(() => this.flush_message_queue(), 0);
    }
    this.message_queue.push(message);
  }

  private flush_message_queue() {
    if (!this.connection) return;
    this.message_queue.push({ type: "syn", i: this.syn });
    this.syn += 1;
    this.connection.send(JSON.stringify(this.message_queue));
    this.sent_messages = [...this.sent_messages, ...this.message_queue];
    this.message_queue = [];
  }

  private update_state(state: broker_state) {
    this.state = state;
    this.on_state_change(state);
  }

  private keep_connection() {
    if (!this.reconnect) return;
    const connection = new eio.Socket(this.url);

    connection.on("close", (reason, desc) => {
      console.log(reason);
      console.log(desc);
      this.connection = undefined;
      setTimeout(() => this.keep_connection(), 100);
      this.update_state({ ...this.state, connected: false });
    });

    connection.on("message", (data) => {
      assert(typeof data === "string");
      const messages = JSON.parse(data);
      assert(Array.isArray(messages));
      messages.forEach((message) => {
        assert(typeof message === "object");
        switch (message.type) {
          case "ack": {
            const { i } = message;
            const idx = this.sent_messages.findIndex(
              (x) => x.type === "syn" && x.i === i
            );
            assert(idx >= 0);
            this.sent_messages.splice(0, idx + 1);
            return;
          }
          case "syn": {
            const { i } = message;
            connection.send(JSON.stringify([{ type: "ack", i }]));
            return;
          }
          case "session": {
            const { is_new } = message;
            assert(typeof is_new === "boolean");
            console.log({ is_new });
            if (is_new) {
              // if we have a saved email/password, login
              const credentials = this.get_credentials();
              if (credentials) {
                this.do_sign_in(credentials);
              }
              // objects might be stale now.
              // all previously fetched objects must be refetched
              const objects = Object.fromEntries(
                Object.entries(this.state.objects).map(([type, h]) => [
                  type,
                  Object.fromEntries(
                    Object.entries(h).map(([id, state]) => {
                      this.send({
                        type: "fetch",
                        object_type: type,
                        object_id: id,
                      });
                      console.log({ in: "refetching", type, id });
                      switch (state.type) {
                        case "fetching":
                        case "stale":
                          return [id, state];
                        case "fetched":
                          return [id, { ...state, type: "stale" }];
                        default:
                          const invalid: never = state;
                          throw invalid;
                      }
                    })
                  ),
                ])
              );
              this.update_state({ ...this.state, objects });
            }
            this.flush_message_queue();
            return;
          }
          case "command_status": {
            const { command_uuid, status } = message as {
              command_uuid: string;
              status: command_status_type;
            };
            this.update_state({
              ...this.state,
              commands: { ...this.state.commands, [command_uuid]: status },
            });
            if (
              this.state.auth_state.type === "signing_up" &&
              this.state.auth_state.command_uuid === command_uuid
            ) {
              if (status === "failed" || status === "aborted") {
                this.update_state({
                  ...this.state,
                  auth_state: {
                    type: "sign_up_error",
                    error: status,
                  },
                });
              }
            }
            const call_back = this.command_callbacks[command_uuid];
            if (
              call_back &&
              (status === "succeeded" ||
                status === "failed" ||
                status === "aborted")
            ) {
              delete this.command_callbacks[command_uuid];
              call_back();
            }
            return;
          }
          case "auth_error": {
            this.update_state({
              ...this.state,
              auth_state: {
                type: "sign_in_error",
                error:
                  "Failed to sign in.  Please check that your email and password are typed correctly.",
              },
            });
            return;
          }
          case "signed_out": {
            this.set_credentials(undefined);
            this.update_state({
              ...this.state,
              auth_state: {
                type: "idle",
              },
            });
            return;
          }
          case "auth": {
            const auth_state = this.state.auth_state;
            const { user_id } = message as { user_id: string };
            switch (auth_state.type) {
              case "signing_up":
              case "signing_in":
              case "resetting_password": {
                const { password } = auth_state;
                this.set_credentials({ user_id, password });
              }
            }
            this.update_state({
              ...this.state,
              auth_state: { type: "authenticated", user_id },
            });
            return;
          }
          case "rev": {
            const rev: {
              type: string;
              id: string;
              t: number;
              i: number;
              data: any;
            } = message.rev;
            const { type, id, t, i, data } = rev;
            this.update_object_state(type, id, { type: "fetched", t, i, data });
            return;
          }
          default:
            throw new Error(`unexpected message type ${message.type}`);
        }
      });
    });

    connection.on("open", () => {
      console.log("connection is open");
      if (this.reconnect) {
        assert(this.connection === undefined);
        this.connection = connection;
        this.update_state({ ...this.state, connected: true });
        connection.send(
          JSON.stringify([{ type: "session", session_id: this.session_id }])
        );
      } else {
        connection.close();
      }
    });
  }

  public submit_command(command_form: command_form, on_done?: () => void) {
    if (on_done) {
      this.command_callbacks[command_form.command_uuid] = on_done;
    }
    this.send({ type: "command", ...command_form });
  }

  private update_object_state(
    type: string,
    id: string,
    new_state: object_state
  ) {
    const prev_state = this.state.objects[type]?.[id];
    function should_update(
      new_state: object_state,
      old_state: object_state | undefined
    ) {
      if (!old_state) return true;
      switch (old_state.type) {
        case "fetching":
          return true;
        case "stale":
        case "fetched": {
          switch (new_state.type) {
            case "fetching":
              return false;
            case "stale":
            case "fetched":
              return (
                old_state.type !== new_state.type ||
                new_state.t > old_state.t ||
                (new_state.t === old_state.t && new_state.i > old_state.i)
              );
            default: {
              const invalid: never = new_state;
              throw invalid;
            }
          }
        }
        default: {
          const invalid: never = old_state;
          throw invalid;
        }
      }
    }
    if (should_update(new_state, prev_state)) {
      this.update_state({
        ...this.state,
        objects: {
          ...this.state.objects,
          [type]: {
            ...(this.state.objects[type] ?? {}),
            [id]: new_state,
          },
        },
      });
    }
  }

  public do_fetch(type: string, id: string) {
    if (this.state.objects[type]?.[id] === undefined) {
      this.update_object_state(type, id, { type: "fetching" });
      this.send({ type: "fetch", object_type: type, object_id: id });
    } else {
      console.log("already fetched");
    }
  }

  public do_sign_up({ email, username, realname, password }: signup_params) {
    const command_uuid = uuidv4();
    const user_id = uuidv4();
    this.send({
      type: "register",
      email,
      username,
      realname,
      password,
      command_uuid,
      user_id,
    });
    this.update_state({
      ...this.state,
      auth_state: {
        type: "signing_up",
        command_uuid,
        user_id,
        username,
        realname,
        email,
        password,
      },
    });
  }

  public do_reset_password({
    code,
    username,
    password,
  }: reset_password_params) {
    const command_uuid = uuidv4();
    this.send({
      type: "reset_password",
      command_uuid,
      code,
      password,
    });
    this.update_state({
      ...this.state,
      auth_state: {
        type: "resetting_password",
        command_uuid,
        username,
        code,
        password,
      },
    });
  }

  public do_sign_in(credentials: credentials) {
    this.send({ type: "sign_in", ...credentials });
    this.update_state({
      ...this.state,
      auth_state: {
        type: "signing_in",
        password: credentials.password,
      },
    });
  }

  public do_signa_out() {
    this.send({ type: "sign_out" });
    this.update_state({
      ...this.state,
      auth_state: {
        type: "signing_out",
      },
    });
  }
}
