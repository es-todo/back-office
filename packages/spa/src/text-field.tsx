import { TextField as MuiTextField } from "@mui/material";

type TextFieldProps = {
  placeholder?: string | undefined;
  editable: boolean;
  value: string;
  set_value: (value: string) => void;
  error?: string | undefined;
  label?: string | undefined;
  required?: boolean;
};

export function TextField({
  placeholder,
  editable,
  value,
  set_value,
  error,
  label,
  required,
}: TextFieldProps) {
  return (
    <MuiTextField
      variant="standard"
      fullWidth
      placeholder={placeholder}
      disabled={!editable}
      value={value}
      onChange={(e) => set_value(e.target.value)}
      error={error !== undefined}
      label={label}
      helperText={error}
      required={required}
    />
  );
}
