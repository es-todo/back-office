import { Context } from "./context";
import { objects } from "./objects";

export type role = objects["user_roles"]["roles"][0];

type RestrictedProps = {
  role: role;
  C: Context;
} & React.PropsWithChildren;

export function Restricted({ C, role, children }: RestrictedProps) {
  if (C.auth_state.type !== "authenticated") return null;
  const user_id = C.auth_state.user_id;
  const user = C.fetch("user_roles", user_id);
  if (user && user.roles.includes(role)) {
    return children;
  } else {
    return null;
  }
}
