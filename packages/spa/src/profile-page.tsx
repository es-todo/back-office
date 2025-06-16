import { Button } from "@mui/material";
import { Context } from "./context";
import { LoginForm, mkemail } from "./login-form";
import { Spinner } from "./spinner";
import { Heading } from "./heading";
import { UpdateRealNameForm } from "./update-real-name-form";
import { TextField } from "./text-field";
import { uuidv4 } from "./uuidv4";
import { useState } from "react";
import {
  image_state,
  UpdateProfilePictureModalDialog,
} from "./update-profile-picture-dialog";
import { UserAvatar } from "./user-avatar";
import { UploadFileButton } from "./upload-file-button";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailIcon from "@mui/icons-material/Email";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import ContactPageIcon from "@mui/icons-material/ContactPage";

type Props = {
  user_id: string;
  C: Context;
};

export function ProfilePageContentForUser({ C, user_id }: Props) {
  const user = C.fetch("user", user_id);
  if (!user) return <Spinner />;

  const [image, set_image] = useState<image_state>(undefined);

  return user.realname || true ? (
    <>
      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <UserAvatar user_id={user_id} size={150} C={C} />
        <h1>Welcome {user.realname || `@${user.username}`} 👋</h1>
      </div>
      <UpdateProfilePictureModalDialog
        user_id={user_id}
        image={image}
        set_image={set_image}
        C={C}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          height: undefined,
        }}
      >
        <Button
          startIcon={<AlternateEmailIcon />}
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
        <Button
          startIcon={<EmailIcon />}
          onClick={() =>
            C.open_dialog({
              title: "Change Email",
              body_text: "Change the email associated with your account.",
              fields: {
                email: {
                  value: "",
                  setter: (value) => {
                    const x = mkemail(value);
                    if (x.error) {
                      return { error: x.error };
                    } else {
                      return { value: x.email };
                    }
                  },
                  render: ({ value, set_value, error }) => (
                    <TextField
                      editable={true}
                      value={value}
                      set_value={set_value}
                      error={error}
                      required
                      label="Email:"
                    />
                  ),
                },
              },
              submit: ({ email }) => ({
                type: "change_email",
                data: {
                  user_id,
                  new_email: email,
                  new_email_message_id: uuidv4(),
                  old_email_message_id: uuidv4(),
                },
              }),
            })
          }
        >
          Change Email
        </Button>
        <Button
          startIcon={<ContactPageIcon />}
          onClick={() =>
            C.open_dialog({
              title: "Update Real Name",
              body_text: "Change your name to be more like who you are.",
              fields: {
                realname: {
                  value: "",
                  setter: (value) => {
                    return { error: undefined, value };
                  },
                  render: ({ value, set_value, error }) => (
                    <TextField
                      editable={true}
                      value={value}
                      set_value={set_value}
                      error={error}
                      required={false}
                      label="Real Name:"
                    />
                  ),
                },
              },
              submit: ({ realname }) => ({
                type: "change_realname",
                data: { user_id, new_realname: realname.trim() },
              }),
            })
          }
        >
          Update Real Name
        </Button>
        <UploadFileButton set_image={set_image} capture="user" />
        <UploadFileButton
          set_image={set_image}
          capture={undefined}
          label="Upload Profile Photo"
        />
        <Button
          startIcon={<LogoutIcon />}
          disabled={C.auth_state.type === "signing_out"}
          onClick={C.do_sign_out}
        >
          SIGN OUT
        </Button>
      </div>
      {!user.realname && (
        <>
          <h1>Let us know who you are.</h1>
          <UpdateRealNameForm key="" user_id={user_id} realname="" C={C} />
        </>
      )}
    </>
  ) : null;
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
    </>
  );
}
