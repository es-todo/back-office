export type command_field = {
  type: "text";
};

export type command_form = {
  command_name: string;
  command_uuid: string | undefined;
  fields: command_field[];
  values: any;
};
