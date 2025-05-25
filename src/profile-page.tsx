import { Paper } from "@mui/material";
import { CommandForm, FormComponent } from "./command-form";
import { Context } from "./context";
import { LoginForm } from "./login-form";
import { Spinner } from "./spinner";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";

const UpdateNameComponent: FormComponent<{ new_name: string }> = ({
  data,
  editable,
  //cancel,
  submit,
  set_data,
}) => (
  <Paper
    style={{
      width: "30%",
      display: "flex",
      flexDirection: "row",
      padding: "2px 2px 12px 12px",
    }}
  >
    <TextField
      editable={editable}
      placeholder="type your name"
      set_value={(x) => set_data({ new_name: x })}
      value={data.new_name}
    />
    <SubmitButton submit={submit} />
  </Paper>
);

function UpdateNameForm({ C }: { C: Context }) {
  return (
    <CommandForm
      data_ok={({ new_name }) => new_name.length > 0}
      make_command={({ new_name }) => ({
        type: "change_user_name",
        data: { new_name },
      })}
      component={UpdateNameComponent}
      initially_editable={true}
      initial_data={{ new_name: "" }}
      C={C}
    />
  );
}
export function ProfilePageContent({ C }: { C: Context }) {
  if (C.auth_state.type === "authenticated") {
    const user = C.fetch("user", C.auth_state.user_id);
    if (!user) return <Spinner />;
    return user.name ? (
      <>
        <h1>Welcome {user.name} 👋</h1>
        <UpdateNameForm C={C} />
      </>
    ) : (
      <>
        <h1>Let us know who you are.</h1>
        <UpdateNameForm C={C} />
      </>
    );
  } else {
    return <LoginForm C={C} />;
  }
}
