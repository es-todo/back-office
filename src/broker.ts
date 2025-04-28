import * as eio from "engine.io-client";
import { v4 as uuidv4 } from "uuid";
import { assert } from "./assert";

type command_status_type = "queued" | "succeeded" | "failed" | "aborted";

export type broker_state = {
  connected: boolean;
  log_in_status: "logged_in" | "logging_in" | "idle";
  commands: { [command_uuid: string]: command_status_type };
};

export const initial_broker_state: broker_state = {
  connected: false,
  log_in_status: "idle",
  commands: {},
};

type command_form = {
  command_uuid: string;
  command_type: string;
  command_data: any;
};

type message =
  | { type: "session"; session_id: string }
  | ({ type: "command" } & command_form)
  | { type: "syn"; i: number };

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

  constructor(url: string, set_state: (state: broker_state) => void) {
    this.url = url;
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
        if (this.sent_messages.length > 0) {
          connection.send(JSON.stringify(this.sent_messages));
        }
        this.send({ type: "session", session_id: this.session_id });
      } else {
        connection.close();
      }
    });
  }

  public submit_command(command_form: command_form) {
    this.send({ type: "command", ...command_form });
  }
}
