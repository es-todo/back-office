import { useEffect, useMemo, useState } from "react";
import { Broker, initial_broker_state } from "./broker.ts";
import { TitleBar } from "./title-bar.tsx";
import { SideMenu } from "./side-menu.tsx";
import { MainContent } from "./main-content.tsx";
import { Box, CssBaseline, Stack, styled, Toolbar } from "@mui/material";

const url = location.protocol + "//" + location.hostname + ":" + location.port;

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth * 3.8}px`,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        //      marginLeft: 0,
        marginLeft: `-${drawerWidth * 1.8}px`,
      },
    },
  ],
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export function App() {
  const [broker_state, set_broker_state] = useState(initial_broker_state);
  const broker = useMemo(
    () => new Broker(url, (state) => set_broker_state(state)),
    []
  );
  useEffect(() => {
    return () => broker.terminate();
  }, [broker]);
  const [open, set_open] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <TitleBar open={open} toggle={() => set_open(!open)} />
      <SideMenu
        open={open}
        onToggle={() => set_open(!open)}
        drawerWidth={drawerWidth}
      />
      <Main open={open}>
        <DrawerHeader />
        <MainContent connected={broker_state.connected} />
      </Main>
    </Box>
  );
}
