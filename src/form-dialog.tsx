// some parts borrowed from from https://mui.com/material-ui/react-dialog/

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Context, Field } from "./context";
import { JSONBox } from "./json-box";
import { assert } from "./assert";
import { command_type } from "schemata/generated/command_type";
import { command_status_type } from "./broker";

type spec = Parameters<Context["open_dialog"]>[0];

export type dialog = {
  spec: spec;
  values: any;
  command_uuid: string | undefined;
};

function DialogField<X>({
  name,
  values,
  set_values,
  entry: { setter, render },
}: {
  name: string;
  values: any;
  set_values: (values: any) => void;
  entry: Field<X>;
}) {
  return (
    <>
      {render({
        value: values[name].value,
        error: values[name].error,
        set_value: (value) => {
          const res = setter(value);
          const val =
            res.error === undefined ? res : { error: res.error, value };
          set_values({ ...values, [name]: val });
        },
      })}
    </>
  );
}

function DialogBody({
  spec,
  values,
  set_values,
}: {
  spec: spec;
  values: any;
  set_values: (values: any) => void;
}) {
  return (
    <>
      <DialogTitle>{spec.title}</DialogTitle>
      <DialogContent>
        <DialogContentText style={{ marginBottom: "10px" }}>
          {spec.body_text}
        </DialogContentText>
        {Object.entries(spec.fields).map(([name, entry]) => (
          <DialogField
            key={name}
            name={name}
            entry={entry as any}
            values={values}
            set_values={set_values}
          />
        ))}
      </DialogContent>
    </>
  );
}

const default_spec: spec = {
  title: "",
  body_text: "",
  fields: {},
  submit: () => {
    throw new Error("invalid");
  },
};

type CommandDialogProps = {
  dialog: dialog | undefined;
  cancel: () => void;
  update: (values: any) => void;
  submit: (command: command_type) => void;
  status: command_status_type | undefined;
};

export function CommandDialog(props: CommandDialogProps) {
  const { dialog, submit, cancel, update, status } = props;
  return (
    <>
      <Dialog
        open={dialog !== undefined}
        onClose={cancel}
        slotProps={{
          paper: {
            component: "form",
          },
        }}
      >
        <DialogBody
          spec={dialog?.spec || default_spec}
          values={dialog?.values || {}}
          set_values={update}
        />
        {false && <JSONBox json={dialog?.values} />}
        <DialogActions>
          <Button onClick={cancel}>Cancel</Button>
          <Button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              assert(dialog);
              const values = Object.fromEntries(
                Object.entries(dialog.values).map(([key, val]) => [
                  key,
                  (val as any).value,
                ])
              );
              const command = dialog.spec.submit(values);
              submit(command);
            }}
            disabled={
              !dialog || Object.values(dialog.values).some((x: any) => x.error)
            }
          >
            Submit
          </Button>
        </DialogActions>
        {status ? (
          <div
            style={{
              marginLeft: "20px",
              marginRight: "20px",
              color: status === "failed" ? "red" : undefined,
            }}
          >
            {status}
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
