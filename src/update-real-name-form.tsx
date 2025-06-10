import { Paper } from "@mui/material";
import { CommandForm, FormComponent } from "./command-form";
import { Context } from "./context";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";

const UpdateNameComponent: FormComponent<{
  orig_realname: string;
  new_realname: string;
}> = ({
  data,
  editable,
  //cancel,
  submit,
  set_data,
}) => (
  <Paper
    style={{
      width: "30%",
      padding: "2px 2px 12px 12px",
    }}
  >
    {data.orig_realname
      ? `Your current name is set to "${data.orig_realname}". To change it, type your new name then click the button.`
      : `Your name is not set.  To set your name, type it in and click the button.`}
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <TextField
        editable={editable}
        placeholder="type your name"
        set_value={(x) => set_data({ ...data, new_realname: x })}
        value={data.new_realname}
      />
      <SubmitButton submit={submit} />
    </div>
  </Paper>
);

export function UpdateRealNameForm({
  user_id,
  realname,
  C,
}: {
  user_id: string;
  realname: string;
  C: Context;
}) {
  return (
    <CommandForm
      data_ok={({ new_realname }) => new_realname.length > 0}
      make_command={({ new_realname }) => ({
        type: "change_realname",
        data: { user_id, new_realname },
      })}
      component={UpdateNameComponent}
      initially_editable={true}
      initial_data={{ orig_realname: realname, new_realname: "" }}
      C={C}
    />
  );
}
