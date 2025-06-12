export type auth_state =
  | { type: "idle" }
  | {
      type: "signing_up";
      command_uuid: string;
      user_id: string;
      username: string;
      realname: string | null;
      email: string;
      password: string;
    }
  | { type: "signing_out" }
  | { type: "sign_up_error"; error: string }
  | { type: "authenticated"; user_id: string }
  | { type: "signing_in"; password: string }
  | { type: "sign_in_error"; error: string }
  | {
      type: "resetting_password";
      command_uuid: string;
      code: string;
      password: string;
      username: string;
    };
