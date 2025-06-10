import { useEffect, useMemo, useState } from "react";
import { Broker, initial_broker_state } from "./broker.ts";
import { TitleBar } from "./title-bar.tsx";
import { SideDrawer } from "./side-drawer.tsx";
import { Router } from "./router.tsx";
import {
  Box,
  Button,
  CssBaseline,
  Modal,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { command_dialog_form } from "./command-dialog-form.ts";
import { LoginForm } from "./login-form.tsx";
import { UserBoards } from "./user-boards.tsx";
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

const modalstyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 1,
};

export function App() {
  const [broker_state, set_broker_state] = useState(initial_broker_state);
  let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
  const broker = useMemo(
    () =>
      new Broker(url, (state) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          set_broker_state(state);
          timeout = undefined;
        }, 0);
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
  const ping = fetch("counter", "ping");

  const [command_forms, set_command_forms] = useState<command_dialog_form[]>(
    []
  );

  useEffect(() => {
    return () => broker.terminate();
  }, [broker]);
  const [open, set_open] = useState(false);
  const open_command_dialog = (
    command_form: Omit<command_dialog_form, "command_uuid" | "values">
  ) =>
    set_command_forms([
      { ...command_form, command_uuid: undefined, values: {} },
      ...command_forms,
    ]);
  const top_command = command_forms[0];
  const top_command_uuid = top_command?.command_uuid;
  const top_command_status =
    top_command_uuid === undefined
      ? undefined
      : broker_state.commands[top_command_uuid];
  if (top_command_status === "succeeded") {
    set_command_forms(
      command_forms.filter((x) => x.command_uuid !== top_command_uuid)
    );
  }

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
      <Modal open={top_command && top_command_status !== "succeeded"}>
        <Box sx={modalstyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {top_command?.command_type ?? null}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            fields go here
          </Typography>
          <Typography>{top_command_status ?? null}</Typography>
          <Stack
            direction="row"
            sx={{ width: "100%" }}
            justifyContent="flex-end"
          >
            <Button onClick={() => set_command_forms(command_forms.slice(1))}>
              Close
            </Button>
            <Button
              disabled={command_forms[0]?.command_uuid !== undefined}
              onClick={() => {
                const [form, ...other_forms] = command_forms;
                const command_uuid = uuidv4();
                set_command_forms([{ ...form, command_uuid }, ...other_forms]);
                broker.submit_command({
                  command_uuid,
                  command_type: form.command_type,
                  command_data: form.values,
                });
              }}
            >
              Submit
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <TitleBar open={open} toggle={() => set_open(!open)} />
        <SideDrawer open={open} onToggle={() => set_open(!open)} />
        <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
          <DrawerHeader />
          <Box sx={{ p: 2 }}>
            <Router connected={broker_state.connected} C={C} />
            <Button
              onClick={() =>
                open_command_dialog({ command_type: "ping", fields: [] })
              }
            >
              Ping {ping?.count ?? null}!
            </Button>
            {broker_state.auth_state.type === "authenticated" ? (
              <UserBoards user_id={broker_state.auth_state.user_id} C={C} />
            ) : (
              <LoginForm C={C} />
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
