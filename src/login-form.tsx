import { validate as email_valid } from "email-validator";
import { Button, Divider, Paper, TextField } from "@mui/material";
import { useState } from "react";

type sign_up_props = {
  set_sign_up: (sign_up: boolean) => void;
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

function SignUpForm({ set_sign_up }: sign_up_props) {
  const [email, set_email] = useState<email_state>(mkemail(""));
  const [password, set_password] = useState<password_state>(mkpassword(""));
  return (
    <div style={{ width: "22em" }}>
      <Paper style={{ padding: "1px 16px 10px" }}>
        <div>
          <h1>Sign Up</h1>
          <form>
            <TextField
              type="text"
              name="email"
              autoComplete="current-email"
              required
              fullWidth
              value={email.email}
              onChange={(e) => set_email(mkemail(e.target.value))}
              error={email.email !== "" && email.error !== undefined}
              helperText={email.error}
              margin="dense"
              label="Email"
            />
            <TextField
              type="password"
              name="password"
              autoComplete="current-password"
              required
              fullWidth
              value={password.password}
              onChange={(e) => set_password(mkpassword(e.target.value))}
              error={password.password !== "" && password.error !== undefined}
              helperText={password.error}
              margin="dense"
              label="Password"
            />
            <Button
              disabled={!!password.error || !!email.error}
              fullWidth
              color="primary"
              size="large"
            >
              Sign Up
            </Button>
          </form>
          <Divider style={{ marginTop: "10px", marginBottom: "5px" }} />
          Already registed?{" "}
          <Button onClick={() => set_sign_up(false)} size="small">
            Sign In
          </Button>
        </div>
      </Paper>
    </div>
  );
}

function SignInForm({ set_sign_up }: sign_up_props) {
  return (
    <div>
      <h1>Sign In Form</h1>
      Not registed? <Button onClick={() => set_sign_up(true)}>Sign Up</Button>
    </div>
  );
}

type login_form_props = {
  logged_in: boolean;
};

export function LoginForm({ logged_in }: login_form_props) {
  if (logged_in) return null;
  const [sign_up, set_sign_up] = useState(true);
  return (
    <div>
      {sign_up ? (
        <SignUpForm set_sign_up={set_sign_up} />
      ) : (
        <SignInForm set_sign_up={set_sign_up} />
      )}
    </div>
  );
}
