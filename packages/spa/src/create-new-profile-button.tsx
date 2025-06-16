import { Button } from "@mui/material";
import { Context } from "./context";
import { mkemail, mkusername } from "./login-form";
import { uuidv4 } from "./uuidv4";
import { TextField } from "./text-field";

export function CreateNewProfileButton({ C }: { C: Context }) {
  function callback() {
    C.open_dialog({
      title: "Create New Profile",
      body_text:
        "The user will be registered and a welcome email with a reset-password link will be sent to the user.",
      fields: {
        username: {
          value: "",
          setter: (x) => {
            const t = mkusername(x);
            return { value: t.username, error: t.error };
          },
          render: ({ value, set_value, error }) => (
            <TextField
              value={value}
              set_value={set_value}
              error={error}
              label="Username"
              required
              editable
            />
          ),
        },
        email: {
          value: "",
          setter: (x) => {
            const t = mkemail(x);
            return { value: t.email, error: t.error };
          },
          render: ({ value, set_value, error }) => (
            <TextField
              value={value}
              set_value={set_value}
              error={error}
              label="Email"
              required
              editable
            />
          ),
        },
      },
      submit: ({ username, email }) => ({
        type: "register",
        data: {
          username,
          email,
          password: null,
          realname: null,
          user_id: uuidv4(),
        },
      }),
    });
  }
  return <Button onClick={callback}>Create New User Profile</Button>;
}
