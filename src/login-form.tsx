import { validate as email_valid } from "email-validator";
import { Button, Divider, Paper, TextField } from "@mui/material";
import { JSX, useState } from "react";
import { sha256 } from "js-sha256";
import { auth_state } from "./auth-state";

type PasswordFieldProps = {
  password: string;
  set_password: (password: string) => void;
  error: string | undefined;
};

function PasswordField(props: PasswordFieldProps) {
  const { password, set_password, error } = props;
  return (
    <TextField
      type="password"
      name="password"
      autoComplete="current-password"
      required
      fullWidth
      value={password}
      onChange={(e) => set_password(e.target.value)}
      error={password !== "" && error !== undefined}
      helperText={error}
      margin="dense"
      label="Password"
    />
  );
}

type EmailFieldProps = {
  email: string;
  set_email: (email: string) => void;
  error: string | undefined;
};

function EmailField(props: EmailFieldProps) {
  const { email, set_email, error } = props;
  return (
    <TextField
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

type sign_in_props = {
  set_sign_up: (sign_up: boolean) => void;
};

type sign_up_props = {
  auth_state: auth_state;
  set_sign_up: (sign_up: boolean) => void;
  do_sign_up: (credentials: { email: string; password: string }) => void;
};

type email_state = {
  email: string;
  error: string | undefined;
};

type password_state = {
  password: string;
  error: string | undefined;
};

function mkemail(email: string): email_state {
  if (email === "") return { email: "", error: "Required" };
  if (email_valid(email)) {
    return { email, error: undefined };
  }
  return { email, error: "Invalid email!" };
}

function mkpassword(password: string): password_state {
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

function SignUpForm({ set_sign_up, do_sign_up, auth_state }: sign_up_props) {
  const [email, set_email] = useState<email_state>(mkemail(""));
  const [password, set_password] = useState<password_state>(mkpassword(""));
  return (
    <Form
      title="Sign Up"
      form={
        <form>
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
              auth_state.type === "signing_up" ||
              auth_state.type === "signing_in"
            }
            fullWidth
            color="primary"
            size="large"
            onClick={() => {
              do_sign_up({
                email: email.email,
                password: sha256(password.password),
              });
            }}
          >
            Sign Up
          </Button>
          {auth_state.type === "sign_up_error" && (
            <>
              Error signing up. Please check that your email is not already
              registered.
            </>
          )}
        </form>
      }
      footer={
        <>
          Already registed?{" "}
          <Button onClick={() => set_sign_up(false)} size="small">
            Sign In
          </Button>
        </>
      }
    />
  );
}

function SignInForm({ set_sign_up }: sign_in_props) {
  const [email, set_email] = useState<email_state>(mkemail(""));
  const [password, set_password] = useState<password_state>(mkpassword(""));
  return (
    <Form
      title="Sign In"
      form={
        <form>
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
            disabled={!!password.error || !!email.error}
            fullWidth
            color="primary"
            size="large"
          >
            Sign In
          </Button>
        </form>
      }
      footer={
        <>
          Not registed?{" "}
          <Button onClick={() => set_sign_up(true)}>Sign Up</Button>
        </>
      }
    />
  );
}

type login_form_props = {
  auth_state: auth_state;
  do_sign_up: (credentials: { email: string; password: string }) => void;
};

export function LoginForm({ auth_state, do_sign_up }: login_form_props) {
  if (auth_state.type === "authenticated") return null;
  const [sign_up, set_sign_up] = useState(true);
  return (
    <div>
      {sign_up ? (
        <SignUpForm
          set_sign_up={set_sign_up}
          do_sign_up={do_sign_up}
          auth_state={auth_state}
        />
      ) : (
        <SignInForm set_sign_up={set_sign_up} />
      )}
    </div>
  );
}
