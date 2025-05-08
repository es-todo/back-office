import { useEffect, useMemo, useState } from "react";
import { Broker, initial_broker_state } from "./broker.ts";
import { TitleBar } from "./title-bar.tsx";
import { SideDrawer } from "./side-drawer.tsx";
import { Router } from "./router.tsx";
import { type object_type } from "schemata/generated/object_type";
import {
  Box,
  Button,
  CssBaseline,
  Modal,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { command_form } from "./command-form.ts";
import { LoginForm } from "./login-form.tsx";

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
  const broker = useMemo(
    () => new Broker(url, (state) => set_broker_state(state)),
    []
  );
  const fetch = useMemo(
    () =>
      <T extends object_type["type"]>(
        type: T,
        id: string
      ): (object_type & { type: T })["data"] | undefined => {
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

  const [command_forms, set_command_forms] = useState<command_form[]>([]);

  useEffect(() => {
    return () => broker.terminate();
  }, [broker]);
  const [open, set_open] = useState(false);
  const open_command_dialog = (
    command_form: Omit<command_form, "command_uuid" | "values">
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
  return (
    <>
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
            <Router connected={broker_state.connected} />
            <Button
              onClick={() =>
                open_command_dialog({ command_type: "ping", fields: [] })
              }
            >
              Ping {ping?.count ?? null}!
            </Button>
            <LoginForm
              auth_state={broker_state.auth_state}
              do_sign_up={(credentials) => broker.do_sign_up(credentials)}
              do_sign_in={(credentials) => broker.do_sign_in(credentials)}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}
