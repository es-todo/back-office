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
import { v4 as uuidv4 } from "uuid";
import { command_form } from "./command-form.ts";

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
  return (
    <>
      <Modal open={command_forms.length > 0}>
        <Box sx={modalstyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {command_forms[0]?.command_type ?? null}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            fields go here
          </Typography>
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
              Ping!
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
