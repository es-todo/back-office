import { Link as MuiLink } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

export function Link({
  to,
  children,
}: { to: string } & React.PropsWithChildren) {
  return (
    <MuiLink to={to} component={RouterLink}>
      {children}
    </MuiLink>
  );
}
