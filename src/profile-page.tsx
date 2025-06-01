import { Paper } from "@mui/material";
import { CommandForm, FormComponent } from "./command-form";
import { Context } from "./context";
import { LoginForm } from "./login-form";
import { Spinner } from "./spinner";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";

const UpdateNameComponent: FormComponent<{
  orig_realname: string;
  new_realname: string;
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
    {data.orig_realname
      ? `Your current name is set to "${data.orig_realname}". To change it, type your new name then click the button.`
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
        set_value={(x) => set_data({ ...data, new_realname: x })}
        value={data.new_realname}
      />
      <SubmitButton submit={submit} />
    </div>
  </Paper>
);

function UpdateNameForm({ C, realname }: { C: Context; realname: string }) {
  return (
    <CommandForm
      data_ok={({ new_realname }) => new_realname.length > 0}
      make_command={({ new_realname }) => ({
        type: "change_realname",
        data: { new_realname },
      })}
      component={UpdateNameComponent}
      initially_editable={true}
      initial_data={{ orig_realname: realname, new_realname: "" }}
      C={C}
    />
  );
}
export function ProfilePageContent({ C }: { C: Context }) {
  if (C.auth_state.type === "authenticated") {
    const user = C.fetch("user", C.auth_state.user_id);
    if (!user) return <Spinner />;
    return user.realname ? (
      <>
        <h1>Welcome {user.realname} 👋</h1>
        <UpdateNameForm key={user.realname} C={C} realname={user.realname} />
      </>
    ) : (
      <>
        <h1>Let us know who you are.</h1>
        <UpdateNameForm key="" C={C} realname="" />
      </>
    );
  } else {
    return <LoginForm C={C} />;
  }
}
