import { command_type } from "schemata/generated/command_type";
import { auth_state } from "./auth-state";
import { broker_state } from "./broker";
import { fetch } from "./fetch";

export type Field<X> = {
  value: X;
  setter: (value: X) => { error: undefined; value: X } | { error: string };
  render: (props: {
    value: X;
    set_value: (value: X) => void;
    error: string | undefined;
  }) => React.ReactElement;
};

type Fields<T> = {
  [K in keyof T]: Field<T[K]>;
};

type open_dialog = <T>(args: {
  title: string;
  body_text: string;
  fields: Fields<T>;
  submit: (data: T) => command_type;
}) => void;

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
  do_sign_out: () => void;
  fetch: fetch;
  commands: broker_state["commands"];
  submit_command: (
    command_uuid: string,
    command: command_type,
    on_done: () => void
  ) => void;
  open_dialog: open_dialog;
};
