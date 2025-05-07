export type auth_state =
  | { type: "idle" }
  | {
      type: "signing_up";
      command_uuid: string;
      user_id: string;
      email: string;
      password: string;
    }
  | { type: "sign_up_error"; error: string }
  | { type: "authenticated"; user_id: string }
  | { type: "signing_in"; email: string; password: string }
  | { type: "sign_in_error"; error: string };
