import { Button } from "@mui/material";
import { Context } from "./context";
import { LoginForm } from "./login-form";
import { Spinner } from "./spinner";
import { Heading } from "./heading";
import { UpdateRealNameForm } from "./update-real-name-form";
import { UpdateUserNameForm } from "./update-username-form";

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
      <h2>Change your username:</h2>
      <UpdateUserNameForm user_id={user_id} C={C} />
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
