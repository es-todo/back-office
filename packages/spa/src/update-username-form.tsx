import { Paper } from "@mui/material";
import { CommandForm, FormComponent } from "./command-form";
import { Context } from "./context";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";
import { mkusername, username_state } from "./login-form";

const UpdateUserNameComponent: FormComponent<username_state> = ({
  data,
  editable,
  //cancel,
  submit,
  set_data,
}) => (
  <Paper
    style={{
      width: "30%",
      padding: "2px 2px 12px 12px",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <TextField
        editable={editable}
        placeholder="your new username"
        set_value={(x) => set_data({ ...data, ...mkusername(x) })}
        value={data.username}
        error={data.error}
      />
      <SubmitButton submit={submit} />
    </div>
  </Paper>
);

type Props = { user_id: string; C: Context };

export function UpdateUserNameForm({ user_id, C }: Props) {
  return (
    <CommandForm
      data_ok={({ username, error }) => username.length > 0 && !error}
      make_command={({ username }) => ({
        type: "change_username",
        data: { user_id, new_username: username },
      })}
      component={UpdateUserNameComponent}
      initially_editable={true}
      initial_data={mkusername("")}
      C={C}
    />
  );
}
