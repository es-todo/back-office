import { validate as email_valid } from "email-validator";
import {
  Button,
  Divider,
  Paper,
  TextField as MuiTextField,
} from "@mui/material";
import { JSX, useState } from "react";
import { Context } from "./context";
import { sha256 } from "js-sha256";
import { uuidv4 } from "./uuidv4";
import { TextField } from "./text-field";
import { MessageDeliveryUI } from "./message-delivery-ui";

type PasswordFieldProps = {
  password: string;
  set_password: (password: string) => void;
  error: string | undefined;
  auto_complete?: boolean;
  label?: string | undefined;
};

export function PasswordField(props: PasswordFieldProps) {
  const { password, set_password, error } = props;
  return (
    <MuiTextField
      type="password"
      name="password"
      autoComplete={
        props.auto_complete === false ? undefined : "current-password"
      }
      required
      fullWidth
      value={password}
      onChange={(e) => set_password(e.target.value)}
      error={password !== "" && error !== undefined}
      helperText={error}
      margin="dense"
      label={props.label ?? "Password"}
    />
  );
}

type EmailFieldProps = {
  email: string;
  set_email: (email: string) => void;
  error: string | undefined;
};

export function EmailField(props: EmailFieldProps) {
  const { email, set_email, error } = props;
  return (
    <MuiTextField
      type="text"
      name="email"
      autoComplete="current-email"
      required
      fullWidth
      value={email}
      onChange={(e) => set_email(e.target.value)}
      error={email !== "" && error !== undefined}
      helperText={error}
      margin="dense"
      label="Email"
    />
  );
}

type UsernameFieldProps = {
  username: string;
  set_username: (username: string) => void;
  error: string | undefined;
};

function UsernameField(props: UsernameFieldProps) {
  const { username, set_username, error } = props;
  return (
    <MuiTextField
      type="text"
      name="username"
      autoComplete="current-username"
      required
      fullWidth
      value={username}
      onChange={(e) => set_username(e.target.value)}
      error={username !== "" && error !== undefined}
      helperText={error}
      margin="dense"
      label="Username"
    />
  );
}

type sign_in_props = {
  set_sign_up: (sign_up: boolean) => void;
  message_id: string | undefined;
  set_message_id: (message_id: string) => void;
  C: Context;
};

type sign_up_props = {
  set_sign_up: (sign_up: boolean) => void;
  message_id: string | undefined;
  set_message_id: (message_id: string) => void;
  C: Context;
};

export type email_state = {
  email: string;
  error: string | undefined;
};

export type username_state = {
  username: string;
  error: string | undefined;
};

export type password_state = {
  password: string;
  error: string | undefined;
};

export function mkemail(email: string): email_state {
  email = email.toLowerCase();
  if (email === "") return { email: "", error: "Required" };
  if (email_valid(email)) {
    return { email, error: undefined };
  }
  return { email, error: "Invalid email!" };
}

export function mkusername(username: string): username_state {
  username = username.replace(/\s/m, "").toLowerCase();
  if (username === "") return { username: "", error: "Required" };
  const m = username.match(/[^a-zA-Z0-9_-]/);
  if (m) {
    return { username, error: `invalid character '${m[0]}'` };
  } else {
    return { username, error: undefined };
  }
}

export function mkpassword(password: string): password_state {
  if (password === "") return { password: "", error: "Required" };
  if (password.length <= 4) {
    return { password, error: "Password too short!" };
  }
  return { password, error: undefined };
}

function Form(props: {
  title: string;
  form: JSX.Element;
  footer: JSX.Element;
}) {
  const { title, form, footer } = props;
  return (
    <div style={{ width: "22em" }}>
      <Paper style={{ padding: "1px 16px 10px" }}>
        <div>
          <h1>{title}</h1>
          {form}
          <Divider style={{ marginTop: "10px", marginBottom: "5px" }} />
          {footer}
        </div>
      </Paper>
    </div>
  );
}

function SignUpForm({ C }: sign_up_props) {
  const { auth_state } = C;
  const [email, set_email] = useState<email_state>(mkemail(""));
  const [username, set_username] = useState<username_state>(mkusername(""));
  const [password, set_password] = useState<password_state>(mkpassword(""));
  return (
    <form>
      <UsernameField
        username={username.username}
        set_username={(username) => set_username(mkusername(username))}
        error={username.error}
      />
      <EmailField
        email={email.email}
        set_email={(email) => set_email(mkemail(email))}
        error={email.error}
      />
      <PasswordField
        password={password.password}
        error={password.error}
        set_password={(password) => set_password(mkpassword(password))}
      />
      <Button
        disabled={
          !!password.error ||
          !!email.error ||
          !!username.error ||
          auth_state.type === "signing_up" ||
          auth_state.type === "signing_in"
        }
        fullWidth
        color="primary"
        size="large"
        onClick={() => {
          C.do_sign_up({
            email: email.email,
            username: username.username,
            realname: "", // TODO: add real name field
            password: sha256(password.password),
          });
        }}
      />
    </form>
  );
}

function ForgotPassword({
  set_message_id,
  C,
}: {
  set_message_id: (message_id: string) => void;
  C: Context;
}) {
  return (
    <>
      Forgot your password?
      <Button
        size="small"
        onClick={() => {
          C.open_dialog({
            title: "Reset your password",
            body_text:
              "Please type youe username or the email you used when you signed up.  We will send you an email with a link to reset your password.",
            fields: {
              email_or_username: {
                value: "",
                setter: (value) => {
                  if (value.length === 0) {
                    return { error: "Required" };
                  }
                  if (value.length < 4) {
                    return { error: "too short" };
                  }
                  return { value };
                },
                render: ({ value, set_value, error }) => (
                  <TextField
                    value={value}
                    set_value={(x) => set_value(x.toLowerCase())}
                    error={error}
                    label="Username or Email"
                    editable
                  />
                ),
              },
            },
            submit: ({ email_or_username }) => {
              const message_id = uuidv4();
              set_message_id(message_id);
              return {
                type: "request_password_reset_code",
                data: {
                  message_id,
                  email_or_username,
                },
              };
            },
          });
        }}
      >
        Reset It
      </Button>
    </>
  );
}

function SignInForm({ C }: sign_in_props) {
  const { auth_state } = C;
  const [username, set_username] = useState<username_state>(mkusername(""));
  const [password, set_password] = useState<password_state>(mkpassword(""));
  return (
    <form>
      <UsernameField
        username={username.username}
        set_username={(username) => set_username(mkusername(username))}
        error={username.error}
      />
      <PasswordField
        password={password.password}
        error={password.error}
        set_password={(password) => set_password(mkpassword(password))}
      />
      <Button
        disabled={
          !!password.error ||
          !!username.error ||
          auth_state.type === "signing_up" ||
          auth_state.type === "signing_in"
        }
        fullWidth
        color="primary"
        size="large"
        onClick={() =>
          C.do_sign_in({
            username: username.username,
            password: sha256(password.password),
          })
        }
      >
        Sign In
      </Button>
      {auth_state.type === "sign_in_error" && (
        <>
          Error signing in. Please check that you typed your email and password
          correctly.
        </>
      )}
    </form>
  );
}

export function LoginForm({ C }: { C: Context }) {
  const { auth_state } = C;
  if (auth_state.type === "authenticated") return null;
  const [sign_up, set_sign_up] = useState(true);
  const [message_id, set_message_id] = useState("");
  return (
    <div>
      <Form
        title={sign_up ? "Sign Up" : "Sign In"}
        form={
          sign_up ? (
            <SignUpForm
              set_sign_up={set_sign_up}
              message_id={message_id}
              set_message_id={set_message_id}
              C={C}
            />
          ) : (
            <SignInForm
              set_sign_up={set_sign_up}
              message_id={message_id}
              set_message_id={set_message_id}
              C={C}
            />
          )
        }
        footer={
          <>
            {sign_up ? "Already registered?" : "Not registered?"}
            <Button size="small" onClick={() => set_sign_up(!sign_up)}>
              {sign_up ? "Sign In" : "Sign Up"}
            </Button>
            <br />
            <ForgotPassword set_message_id={set_message_id} C={C} />
            <MessageDeliveryUI message_id={message_id} C={C} />
          </>
        }
      ></Form>
    </div>
  );
}
