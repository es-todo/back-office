type command_field = {
  type: "text";
};

export type command_dialog_form = {
  command_type: string;
  command_uuid: string | undefined;
  fields: command_field[];
  values: any;
};
