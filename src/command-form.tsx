import { command_type } from "schemata/generated/command_type";
import { broker_state } from "./broker";
import { useState } from "react";
import { uuidv4 } from "./uuidv4";
import { Context } from "./context";

type form_state =
  | { type: "idle" }
  | { type: "editing" }
  | { type: "submitting"; command_uuid: string };

const form_editable: (
  state: form_state,
  commands: broker_state["commands"]
) => boolean = (state, commands) => {
  switch (state.type) {
    case "idle":
      return false;
    case "editing":
      return true;
    case "submitting": {
      const command_state = commands[state.command_uuid];
      switch (command_state) {
        case undefined:
        case "queued":
          return false;
        case "succeeded":
        case "failed":
        case "aborted":
          return true;
        default:
          const invalid: never = command_state;
          throw invalid;
      }
    }
    default:
      const invalid: never = state;
      throw invalid;
  }
};

export type FormComponent<T> = React.FunctionComponent<{
  data: T;
  set_data: (data: T) => void;
  editable: boolean;
  submit: (() => void) | undefined;
  cancel: () => void;
  C: Context;
}>;

type CommandFormProps<T> = {
  initial_data: T;
  data_ok: (data: T) => boolean;
  make_command: (data: T) => command_type;
  component: FormComponent<T>;
  initially_editable: boolean;
  C: Context;
};

export function CommandForm<T>({
  initial_data,
  data_ok,
  make_command,
  component: Component,
  initially_editable,
  C,
}: CommandFormProps<T>) {
  const [state, set_state] = useState<form_state>(
    initially_editable ? { type: "editing" } : { type: "idle" }
  );
  const [data, set_data] = useState(initial_data);
  const editable = form_editable(state, C.commands);
  const submit = data_ok(data)
    ? () => {
        const command = make_command(data);
        const command_uuid = uuidv4();
        set_state({ type: "submitting", command_uuid });
        //C.submit_command(command_uuid, command, () => set_data(initial_data));
        C.submit_command(command_uuid, command, () => {});
        console.log("Submitting");
      }
    : undefined;
  function cancel() {
    set_state({ type: "idle" });
    set_data(initial_data);
  }
  return (
    <Component
      editable={editable}
      data={data}
      set_data={set_data}
      submit={submit}
      cancel={cancel}
      C={C}
    />
  );
}
