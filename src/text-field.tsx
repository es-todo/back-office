import { TextField as MuiTextField } from "@mui/material";

type TextFieldProps = {
  placeholder: string;
  editable: boolean;
  value: string;
  set_value: (value: string) => void;
};

export function TextField({
  placeholder,
  editable,
  value,
  set_value,
}: TextFieldProps) {
  return (
    <MuiTextField
      variant="standard"
      fullWidth
      placeholder={placeholder}
      disabled={!editable}
      value={value}
      onChange={(e) => set_value(e.target.value)}
    />
  );
}
