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
  | { type: "sign_up_error"; error: string }
  | { type: "authenticated"; user_id: string }
  | { type: "signing_in"; username: string; password: string }
  | { type: "sign_in_error"; error: string };
