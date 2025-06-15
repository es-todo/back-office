import { Link as MuiLink } from "@mui/material";
import { PropsWithChildren } from "react";
import { Link as RouterLink } from "react-router-dom";

type Props = {
  to: string | undefined;
} & PropsWithChildren;

export function Link({ to, children }: Props) {
  return to ? (
    <MuiLink to={to} component={RouterLink}>
      {children}
    </MuiLink>
  ) : (
    <>{children}</>
  );
}
