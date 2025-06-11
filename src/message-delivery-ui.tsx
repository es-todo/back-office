import { Context } from "./context";

export function MessageDeliveryUI({
  message_id,
  C,
}: {
  message_id: string | undefined;
  C: Context;
}) {
  if (!message_id) return null;
  const message = C.fetch("email_message_delivery_status", message_id);
  if (!message) return null;
  const { status } = message;
  switch (status.type) {
    case "queued":
      return <p>Email is generated and is being sent. Hold on tight.</p>;
    case "sent":
      return (
        <p>
          Email is sent. Please check your Inbox and your spam/junk folder just
          in case.
        </p>
      );
    case "failed":
      return <p>Message failed to send: {status.reason}!</p>;
    default:
      const invalid: never = status;
      throw invalid;
  }
}
