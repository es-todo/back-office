import { Link as MuiLink } from "@mui/material";
import { PropsWithChildren } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

function MyRouterLink({ to, children }: { to: string } & PropsWithChildren) {
  const location = useLocation();
  return (
    <RouterLink
      className={location.pathname === to ? "disabled" : undefined}
      style={
        location.pathname === to
          ? { pointerEvents: "none", cursor: "default" }
          : {}
      }
      to={to}
    >
      {children}
    </RouterLink>
  );
}

type Props = {
  to: string | undefined;
} & PropsWithChildren;

export function Link({ to, children }: Props) {
  return to ? (
    <MuiLink to={to} component={MyRouterLink}>
      {children}
    </MuiLink>
  ) : (
    <>{children}</>
  );
}
