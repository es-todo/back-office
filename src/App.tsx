import { useEffect, useMemo, useState } from "react";
import { Broker, initial_broker_state } from "./broker.ts";
import {
  Box,
  Flex,
  Heading,
  IconButton,
  useDisclosure,
  Button,
  VStack,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons/Hamburger";
import { CloseIcon } from "@chakra-ui/icons/Close";

function TitleBar(props: { open: boolean; onToggle: () => void }) {
  const { open, onToggle } = props;
  return (
    <Box color="white" py={1} px={1}>
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={3}>
          <IconButton
            aria-label="Toggle Menu"
            variant="outline"
            colorScheme="whiteAlpha"
            onClick={onToggle}
            display={{ base: "block", md: "none" }} // Hide on desktop if you like
          >
            {open ? <CloseIcon /> : <HamburgerIcon />}
          </IconButton>
          <Heading size="md">Back Office App</Heading>
        </Flex>
      </Flex>
    </Box>
  );
}

function SideMenu({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <Box
      as="nav"
      width={{ base: open ? "200px" : "0", md: "200px" }}
      transition="width 0.2s"
      overflow="hidden"
    >
      <VStack align="stretch" gap={2} p={4}>
        <Button variant="ghost" onClick={onToggle}>
          Dashboard
        </Button>
        <Button variant="ghost" onClick={onToggle}>
          Settings
        </Button>
        <Button variant="ghost" onClick={onToggle}>
          Profile
        </Button>
      </VStack>
    </Box>
  );
}

function MainContent(props: { connected: boolean }) {
  const { connected } = props;
  return (
    <>
      <Heading size="lg" mb={4}>
        Welcome to My App. We are {connected ? "connected." : "connecting ..."}
      </Heading>
      <p>This is the main content area. Add routes or other components here.</p>
    </>
  );
}

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
