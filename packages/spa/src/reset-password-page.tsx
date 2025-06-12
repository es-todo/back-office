import { useParams } from "react-router-dom";
import { Context } from "./context";
import { Spinner } from "./spinner";
import { ResetPasswordWithCodeForm } from "./reset-password-with-code-form";

export function ErrorPage({ error }: { error: string }) {
  return <>Error: {error}</>;
}

function DoResetPasswordPage({ code, C }: { code: string; C: Context }) {
  const obj = C.fetch("password_reset_code", code);
  const user = obj ? C.fetch("user", obj.user_id) : undefined;
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          paddingTop: "3em",
        }}
      >
        {obj && user ? (
          <ResetPasswordWithCodeForm
            used={obj.used}
            username={user.username}
            code={code}
            C={C}
          />
        ) : (
          <Spinner />
        )}
      </div>
    </>
  );
}

export function ResetPasswordPage({ C }: { C: Context }) {
  const params = useParams();
  const code = params.code;
  if (!code) return <ErrorPage error={"no code"} />;
  return <DoResetPasswordPage code={code} C={C} />;
}
