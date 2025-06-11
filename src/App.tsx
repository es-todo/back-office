import { useEffect, useMemo, useState } from "react";
import { Broker, credentials, initial_broker_state } from "./broker.ts";
import { TitleBar } from "./title-bar.tsx";
import { SideDrawer } from "./side-drawer.tsx";
import { Router } from "./router.tsx";
import { Box, CssBaseline, styled } from "@mui/material";
import { fetch } from "./fetch.ts";
import { uuidv4 } from "./uuidv4.ts";
import { Context } from "./context.ts";
import { CommandDialog, dialog } from "./form-dialog.tsx";
import { command_type } from "schemata/generated/command_type";

const url = location.protocol + "//" + location.hostname + ":" + location.port;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

function set_credentials(credentials: credentials | undefined) {
  if (credentials) {
    const { username, password } = credentials;
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
  } else {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
  }
}

function get_credentials() {
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");
  if (username && password) {
    return { username, password };
  } else {
    return undefined;
  }
}

//// remove the stored password (if any) if you land on reset-password
//if (location.pathname.startsWith("/reset-password/")) {
//  console.log("deleting password");
//  set_credentials(undefined);
//}

export function App() {
  const [broker_state, set_broker_state] = useState(initial_broker_state);
  let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
  const broker = useMemo(
    () =>
      new Broker({
        url,
        set_state: (state) => {
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(() => {
            set_broker_state(state);
            timeout = undefined;
          }, 0);
        },
        get_credentials,
        set_credentials,
      }),
    []
  );
  const fetch = useMemo<fetch>(
    () => (type, id) => {
      const state = broker_state.objects[type]?.[id];
      if (!state) {
        broker.do_fetch(type, id);
        return undefined;
      }
      switch (state.type) {
        case "fetching":
          return undefined;
        case "fetched":
        case "stale":
          return state.data;
        default: {
          const invalid: never = state;
          throw invalid;
        }
      }
    },
    [broker_state, broker]
  );

  useEffect(() => {
    return () => broker.terminate();
  }, [broker]);
  const [open, set_open] = useState(false);

  const [dialogs, set_dialogs] = useState<dialog[]>([]);
  const C: Context = {
    auth_state: broker_state.auth_state,
    user_id:
      broker_state.auth_state.type === "authenticated"
        ? broker_state.auth_state.user_id
        : undefined,
    do_sign_up: (credentials) => broker.do_sign_up(credentials),
    do_sign_in: (credentials) => broker.do_sign_in(credentials),
    do_sign_out: () => broker.do_signa_out(),
    do_reset_password: (args) => broker.do_reset_password(args),

    fetch: fetch,
    commands: broker_state.commands,
    submit_command: (command_uuid, { type, data }, on_done) =>
      broker.submit_command(
        {
          command_uuid,
          command_type: type,
          command_data: data,
        },
        on_done
      ),
    open_dialog: (args) => {
      set_dialogs([
        {
          spec: args as any,
          command_uuid: undefined,
          values: Object.fromEntries(
            Object.entries(args.fields).map(([k, v]: [k: string, v: any]) => {
              const res = v.setter(v.value);
              return [
                k,
                res.error
                  ? { error: res.error, value: v.value }
                  : { error: undefined, value: v.value },
              ];
            })
          ),
        },
        ...dialogs,
      ]);
    },
  };

  const top_dialog = dialogs[0];
  const top_dialog_uuid = top_dialog?.command_uuid;
  const top_dialog_status =
    top_dialog_uuid === undefined
      ? undefined
      : broker_state.commands[top_dialog_uuid];
  if (top_dialog_status === "succeeded") {
    set_dialogs(dialogs.filter((x) => x.command_uuid !== top_dialog_uuid));
  }

  return (
    <>
      <CommandDialog
        dialog={top_dialog}
        cancel={() => set_dialogs(dialogs.filter((x) => x !== top_dialog))}
        update={(values) =>
          set_dialogs(
            dialogs.map((x) => (x === top_dialog ? { ...x, values } : x))
          )
        }
        submit={(command: command_type) => {
          const command_uuid = uuidv4();
          broker.submit_command({
            command_uuid,
            command_type: command.type,
            command_data: command.data,
          });
          set_dialogs(
            dialogs.map((x) => (x === top_dialog ? { ...x, command_uuid } : x))
          );
        }}
        status={top_dialog_status}
      />
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <TitleBar open={open} toggle={() => set_open(!open)} />
        <SideDrawer open={open} onToggle={() => set_open(!open)} />
        <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
          <DrawerHeader />
          <Box sx={{ p: 2 }}>
            <Router connected={broker_state.connected} C={C} />
          </Box>
        </Box>
      </Box>
    </>
  );
}
