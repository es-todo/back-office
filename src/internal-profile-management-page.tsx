import { Paper } from "@mui/material";
import { Context } from "./context";
import { Spinner } from "./spinner";
import { TextField } from "./text-field";
import { useState } from "react";
import { Restricted } from "./restricted";
import { ProfilePageContentForUser } from "./profile-page";

const elevation = 10;

type SearchUserProps = {
  C: Context;
};

function SearchUser({ C }: SearchUserProps) {
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
        {user === undefined ? (
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
              User profile follows. Proceed with caution and don't change things
              you don't need to change. This is a privileged functionality and
              is monitored and logged.
              <span style={{ fontSize: "2em" }}>✋🛑⛔️</span>
            </div>
          </div>
        )}
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
