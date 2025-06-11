import { Context } from "./context";

export function MessageDeliveryUI({
  message_id,
  C,
}: {
  message_id: string;
  C: Context;
}) {
  if (!message_id) return null;
  const message = C.fetch("email_message_delivery_status", message_id);
  if (!message) return null;
  const { status } = message;
  switch (status.type) {
    case "queued":
      return <>Email message is generated and is being sent. Hold on tight.</>;
    case "sent":
      return (
        <>
          Email message is sent. Please check your Inbox and your spam/junk
          folder just in case.
        </>
      );
    case "failed":
      return <>Message failed to send: {status.reason}!</>;
    default:
      const invalid: never = status;
      throw invalid;
  }
}
