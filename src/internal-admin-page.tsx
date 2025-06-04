import { Avatar, Paper } from "@mui/material";
import { Context } from "./context";
import { objects } from "./objects";
import { Spinner } from "./spinner";
import { TextField } from "./text-field";
import { useState } from "react";

type InternalAdminPageProps = {
  C: Context;
};

type role = objects["user_roles"]["roles"][0];

type RestrictedProps = {
  role: role;
  C: Context;
} & React.PropsWithChildren;

function Restricted({ C, role, children }: RestrictedProps) {
  if (C.auth_state.type !== "authenticated") return null;
  const user_id = C.auth_state.user_id;
  const user = C.fetch("user_roles", user_id);
  if (user && user.roles.includes(role)) {
    return children;
  } else {
    return null;
  }
}

type SmallUserProfileProps = {
  user_id: string;
  C: Context;
};

// from https://mui.com/material-ui/react-avatar/
function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

// from https://mui.com/material-ui/react-avatar/
function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: name.slice(0, 2),
  };
}

function UserProfileDetails({ user_id }: SmallUserProfileProps) {
  return (
    <>
      <div style={{ fontSize: ".7rem" }}>
        UUID: <span style={{ fontFamily: "monospace" }}>{user_id}</span>
      </div>
    </>
  );
}

function SmallUserProfile({ user_id, C }: SmallUserProfileProps) {
  const user = C.fetch("user", user_id);
  const [detailed, set_detailed] = useState(false);
  if (!user) return <Spinner />;
  return (
    <div>
      <div
        style={{
          padding: "5px",
          border: "1px solid silver",
          borderRadius: "4px",
        }}
      >
        <Avatar {...stringAvatar(user.username || user.realname || "?")} />
        <div>Name: {user.realname}</div>
        <div>Email: {user.email}</div>
        <div>Username: @{user.username}</div>
        <div
          style={{ cursor: "pointer", height: "20px", textAlign: "center" }}
          onClick={() => set_detailed(!detailed)}
        >
          {detailed ? "⇈" : "⋯"}
        </div>
        {detailed && <UserProfileDetails user_id={user_id} C={C} />}
      </div>
    </div>
  );
}

type ManageRoleProps = {
  role_id: string;
  C: Context;
};

const elevation = 10;

function ManageRole({ role_id, C }: ManageRoleProps) {
  const role = C.fetch("role_users", role_id);
  const user_ids =
    role === undefined ? undefined : role === null ? [] : role.user_ids;
  return (
    <Paper
      elevation={elevation}
      style={{ paddingLeft: "10px", paddingRight: "10px" }}
    >
      <h2 style={{ textTransform: "capitalize" }}>{role_id} role</h2>
      <p style={{ fontStyle: "italic" }}>
        {(roles as Record<string, string>)[role_id] ?? null}
      </p>
      {user_ids === undefined ? (
        <Spinner />
      ) : user_ids.length === 0 ? (
        <>There are no users assigned to this role.</>
      ) : (
        user_ids.map((user_id) => (
          <SmallUserProfile key={user_id} user_id={user_id} C={C} />
        ))
      )}
    </Paper>
  );
}

type SearchUserProps = {
  C: Context;
};

function SearchUser({ C }: SearchUserProps) {
  const [searchstr, set_searchstr] = useState("");
  const user = C.fetch("username", searchstr);

  return (
    <Paper
      elevation={elevation}
      style={{ paddingLeft: "10px", paddingRight: "10px" }}
    >
      <h2 style={{ textTransform: "capitalize" }}>Assign Roles</h2>
      <TextField
        value={searchstr}
        placeholder="find a user by username"
        editable={true}
        set_value={set_searchstr}
      />
      {user === undefined ? (
        <Spinner />
      ) : user === null ? (
        <>No exact match for @{searchstr}</>
      ) : (
        <SmallUserProfile user_id={user.user_id} C={C} />
      )}
    </Paper>
  );
}

const roles: { [k in role]: string } = {
  admin:
    "Assigns and revokes roles to/from internal users.  Must be used sparingly.",
  "profile-management":
    "Manages user profiles creation and updates. Can post reviews on behalf of users.",
  automation:
    "Internal role for automation bots (e.g., email sending automation, etc.).",
};

export function InternalAdminPage({ C }: InternalAdminPageProps) {
  return (
    <Restricted role="admin" C={C}>
      <h1>Internal User-Privileges Panel</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: "400px", minWidth: "400px" }}>
          {Object.keys(roles).map((role_id) => (
            <ManageRole key={role_id} role_id={role_id} C={C} />
          ))}
        </div>
        <div style={{ maxWidth: "400px", minWidth: "400px" }}>
          <SearchUser C={C} />
        </div>
      </div>
    </Restricted>
  );
}
