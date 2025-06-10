import { Button, Paper } from "@mui/material";
import { CommandForm, FormComponent } from "./command-form";
import { Context } from "./context";
import { LoginForm } from "./login-form";
import { Spinner } from "./spinner";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";
import { Heading } from "./heading";

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

function UpdateRealNameForm({
  user_id,
  realname,
  C,
}: {
  user_id: string;
  realname: string;
  C: Context;
}) {
  return (
    <CommandForm
      data_ok={({ new_realname }) => new_realname.length > 0}
      make_command={({ new_realname }) => ({
        type: "change_realname",
        data: { user_id, new_realname },
      })}
      component={UpdateNameComponent}
      initially_editable={true}
      initial_data={{ orig_realname: realname, new_realname: "" }}
      C={C}
    />
  );
}

export function ProfilePageContentForUser({
  C,
  user_id,
}: {
  user_id: string;
  C: Context;
}) {
  const user = C.fetch("user", user_id);
  if (!user) return <Spinner />;
  return user.realname ? (
    <>
      <h1>Welcome {user.realname} 👋</h1>
      <UpdateRealNameForm
        key={user.realname}
        user_id={user_id}
        realname={user.realname}
        C={C}
      />
    </>
  ) : (
    <>
      <h1>Let us know who you are.</h1>
      <UpdateRealNameForm key="" user_id={user_id} realname="" C={C} />
    </>
  );
}

function ProfilePageContent({ C }: { C: Context }) {
  if (C.auth_state.type === "authenticated") {
    return <ProfilePageContentForUser user_id={C.auth_state.user_id} C={C} />;
  } else {
    return <LoginForm C={C} />;
  }
}

export function ProfilePage({ C }: { C: Context }) {
  return (
    <>
      <Heading level={1}>Profile</Heading>
      <ProfilePageContent C={C} />
      {C.user_id && (
        <Button
          disabled={C.auth_state.type === "signing_out"}
          onClick={C.do_sign_out}
        >
          SIGN OUT
        </Button>
      )}
      <p>This is the main profile area.</p>
    </>
  );
}
