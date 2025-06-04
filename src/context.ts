import { command_type } from "schemata/generated/command_type";
import { auth_state } from "./auth-state";
import { broker_state } from "./broker";
import { fetch } from "./fetch";

export type Context = {
  auth_state: auth_state;
  user_id: string | undefined;
  do_sign_up: (credentials: {
    email: string;
    username: string;
    password: string;
    realname: string;
  }) => void;
  do_sign_in: (credentials: { username: string; password: string }) => void;
  fetch: fetch;
  commands: broker_state["commands"];
  submit_command: (
    command_uuid: string,
    command: command_type,
    on_done: () => void
  ) => void;
};
