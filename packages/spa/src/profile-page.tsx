import { Button } from "@mui/material";
import { Context } from "./context";
import { LoginForm } from "./login-form";
import { Spinner } from "./spinner";
import { Heading } from "./heading";
import { UpdateRealNameForm } from "./update-real-name-form";
import { TextField } from "./text-field";

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
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          height: undefined,
          overflowY: "hidden",
        }}
      >
        <Button
          onClick={() =>
            C.open_dialog({
              title: "Change Username",
              body_text: "Change your user name to a new special name.",
              fields: {
                username: {
                  value: "",
                  setter: (value) => {
                    if (value.length === 0) {
                      return { error: "Required" };
                    } else {
                      return { value: value.toLowerCase() };
                    }
                  },
                  render: ({ value, set_value, error }) => (
                    <TextField
                      editable={true}
                      value={value}
                      set_value={set_value}
                      error={error}
                      required
                      label="Username:"
                    />
                  ),
                },
              },
              submit: ({ username }) => ({
                type: "change_username",
                data: { user_id, new_username: username },
              }),
            })
          }
        >
          Update Username
        </Button>
      </div>

      <UpdateRealNameForm
        key={user.realname}
        user_id={user_id}
        realname={user.realname}
        C={C}
      />
      <h2>Change your username:</h2>
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
