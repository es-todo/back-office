import { Paper } from "@mui/material";
import { CommandForm, FormComponent } from "./command-form";
import { Context } from "./context";
import { LoginForm } from "./login-form";
import { Spinner } from "./spinner";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";

const UpdateNameComponent: FormComponent<{
  orig_name: string;
  new_name: string;
}> = ({
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
    {data.orig_name
      ? `Your current name is set to "${data.orig_name}". To change it, type your new name then click the button.`
      : `Your name is not set.  To set your name, type it in and click the button.`}
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <TextField
        editable={editable}
        placeholder="type your name"
        set_value={(x) => set_data({ ...data, new_name: x })}
        value={data.new_name}
      />
      <SubmitButton submit={submit} />
    </div>
  </Paper>
);

function UpdateNameForm({ C, name }: { C: Context; name: string }) {
  return (
    <CommandForm
      data_ok={({ new_name }) => new_name.length > 0}
      make_command={({ new_name }) => ({
        type: "change_user_name",
        data: { new_name },
      })}
      component={UpdateNameComponent}
      initially_editable={true}
      initial_data={{ orig_name: name, new_name: "" }}
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
        <UpdateNameForm key={user.name} C={C} name={user.name} />
      </>
    ) : (
      <>
        <h1>Let us know who you are.</h1>
        <UpdateNameForm key="" C={C} name="" />
      </>
    );
  } else {
    return <LoginForm C={C} />;
  }
}
