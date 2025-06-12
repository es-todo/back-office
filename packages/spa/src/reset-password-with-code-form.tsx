import { Paper } from "@mui/material";
import { Context } from "./context";
import { SubmitButton } from "./submit-button";
import { mkpassword, password_state, PasswordField } from "./login-form";
import { Heading } from "./heading";
import { sha256 } from "js-sha256";
import { useState } from "react";
import { Link } from "./link";

function mkpasswords(
  password1: string,
  password2: string
): { password1: password_state; password2: password_state } {
  return {
    password1: mkpassword(password1),
    password2: {
      password: password2,
      error:
        password1 === password2 ? undefined : "should match first password",
    },
  };
}

type Props = {
  used: boolean;
  username: string;
  code: string;
  C: Context;
};

export function ResetPasswordWithCodeForm({ username, used, code, C }: Props) {
  const [data, set_data] = useState(mkpasswords("", ""));
  const allow =
    data.password1.error === undefined &&
    data.password2.error === undefined &&
    data.password1.password === data.password2.password &&
    !used;
  return (
    <Paper
      style={{
        padding: "2px 12px 12px 12px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Heading>Reset Password for @{username}</Heading>
        {C.user_id ? (
          <p>
            You are logged in. You may go to the{" "}
            <Link to="/profile">profile page</Link> to check your profile.
          </p>
        ) : used ? (
          <p>This reset code has already been used.</p>
        ) : (
          <>
            <form>
              <PasswordField
                label="Your new password"
                password={data.password1.password}
                set_password={(x) =>
                  set_data({
                    ...data,
                    ...mkpasswords(x, data.password2.password),
                  })
                }
                error={data.password1.error}
              />
              <PasswordField
                label="Retype password"
                password={data.password2.password}
                set_password={(x) =>
                  set_data({
                    ...data,
                    ...mkpasswords(data.password1.password, x),
                  })
                }
                error={data.password2.error}
              />
            </form>
            <SubmitButton
              submit={
                allow
                  ? () => {
                      C.do_reset_password({
                        username,
                        code,
                        password: sha256(data.password1.password),
                      });
                    }
                  : undefined
              }
            />
          </>
        )}
      </div>
    </Paper>
  );
}
