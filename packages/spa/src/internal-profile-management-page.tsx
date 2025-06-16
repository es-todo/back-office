import { Paper } from "@mui/material";
import { Context } from "./context";
import { Spinner } from "./spinner";
import { TextField } from "./text-field";
import { useState } from "react";
import { Restricted } from "./restricted";
import { ProfilePageContentForUser } from "./profile-page";
import { UserAvatar } from "./user-avatar";

const elevation = 10;

function RecentUsers({
  set_searchstr,
  C,
}: {
  set_searchstr: (string: string) => void;
  C: Context;
}) {
  const list = C.fetch("users_list", "recent");
  return (
    <>
      <h2>Recent Users</h2>
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        {list &&
          list.user_ids.map((user_id) => {
            const user = C.fetch("user", user_id);
            return (
              <div
                key={user_id}
                style={{
                  margin: 10,
                  display: "flex",
                  flexDirection: "row",
                  gap: 5,
                  cursor: user ? "pointer" : undefined,
                  //justifyItems: "center",
                }}
                onClick={user ? () => set_searchstr(user.username) : undefined}
              >
                <UserAvatar user_id={user_id} size={45} C={C} />
                {user ? (
                  <div style={{ alignContent: "center" }}>
                    <div>@{user.username}</div>
                    <div>{user.email}</div>
                  </div>
                ) : (
                  <>...</>
                )}
              </div>
            );
          })}
      </div>
    </>
  );
}

type Props = { C: Context };

function SearchUser({ C }: Props) {
  const [searchstr, set_searchstr] = useState("");
  const user = C.fetch("username_redirect", searchstr);
  return (
    <>
      <Paper elevation={elevation} style={{ padding: "10px" }}>
        <h2 style={{ margin: "0px" }}>Update profiles of other users</h2>
        <TextField
          value={searchstr}
          placeholder="find a user by username"
          editable={true}
          set_value={set_searchstr}
        />
        <div>
          {!searchstr ? (
            <RecentUsers set_searchstr={set_searchstr} C={C} />
          ) : user === undefined ? (
            <Spinner />
          ) : user === null ? (
            <>No exact match for @{searchstr}</>
          ) : (
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "small" }}>
                UUID: {user.user_id}
              </div>
              <div
                style={{
                  backgroundColor: "red",
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "2em" }}>✋🛑⛔️</span>
                User profile follows. Proceed with caution and don't change
                things you don't need to change. This is a privileged
                functionality and is monitored and logged.
                <span style={{ fontSize: "2em" }}>✋🛑⛔️</span>
              </div>
            </div>
          )}
        </div>
      </Paper>
      {user && (
        <Paper>
          <ProfilePageContentForUser user_id={user.user_id} C={C} />
        </Paper>
      )}
    </>
  );
}

type PageProps = {
  C: Context;
};

export function InternalProfileManagementPage({ C }: PageProps) {
  return (
    <Restricted role="profile-management" C={C}>
      <h1>Internal Profiles Management Panel</h1>
      <SearchUser C={C} />
    </Restricted>
  );
}
