import { useParams } from "react-router-dom";
import { Context } from "./context";
import { Heading } from "./heading";
import { useEffect, useState } from "react";
import { uuidv4 } from "./uuidv4";

type VerifyEmailPageProps = {
  C: Context;
};

export function ErrorPage({ error }: { error: string }) {
  return <>Error: {error}</>;
}

export function VerifyEmailPage({ C }: VerifyEmailPageProps) {
  const params = useParams();
  const code = params.code;
  if (!code) return <ErrorPage error="missing code" />;
  const status = C.fetch("email_confirmation_code", code);
  const [command_uuid, set_command_uuid] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    if (!status || status.received || command_uuid || !code) return;
    const uuid = uuidv4();
    set_command_uuid(uuid);
    console.log("Verifying ...");
    C.submit_command(
      uuid,
      {
        type: "receive_email_confirmation_code",
        data: { code: code },
      },
      () => {}
    );
  }, [status, command_uuid]);
  return (
    <>
      <Heading>Email Verification</Heading>
      {!status ? (
        <>
          <h2>Checking the status of your email...</h2>
        </>
      ) : status.received ? (
        <>
          <h2>Your email is now verified 🎉🎉🎉</h2>
        </>
      ) : (
        <>
          <h2>Verifying your email ... Hang on tight ...</h2>
          <p>{(command_uuid && C.commands[command_uuid]) || null}</p>
        </>
      )}
    </>
  );
}
