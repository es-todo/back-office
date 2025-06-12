import { IconButton } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

type SubmitButtonProps = {
  submit: (() => void) | undefined;
};

export function SubmitButton({ submit }: SubmitButtonProps) {
  return (
    <IconButton
      aria-label="edit"
      onClick={submit}
      size="small"
      color="primary"
      disabled={!submit}
    >
      <CheckIcon fontSize="inherit" />
    </IconButton>
  );
}
