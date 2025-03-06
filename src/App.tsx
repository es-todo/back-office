import { useEffect, useMemo, useState } from "react";
import { Broker, initial_broker_state } from "./broker.ts";
import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { TitleBar } from "./title-bar.tsx";
import { SideMenu } from "./side-menu.tsx";
import { MainContent } from "./main-content.tsx";

const url = location.protocol + "//" + location.hostname + ":" + location.port;

export function App() {
  const [broker_state, set_broker_state] = useState(initial_broker_state);
  const broker = useMemo(
    () => new Broker(url, (state) => set_broker_state(state)),
    []
  );
  useEffect(() => {
    return () => broker.terminate();
  }, [broker]);
  const { open, onToggle, onClose } = useDisclosure();

  return (
    <Flex flexDirection="column" minHeight="100vh">
      <TitleBar open={open} onToggle={onToggle} />
      <Flex flex="1" minH="0">
        <SideMenu open={open} onToggle={onToggle} />
        <Box as="main" flex="1" p={6} onClick={onClose}>
          <MainContent connected={broker_state.connected} />
        </Box>
      </Flex>
    </Flex>
  );
}
