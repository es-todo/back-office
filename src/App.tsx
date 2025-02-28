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
import { Link, Route, Routes } from "react-router-dom";

function TitleBar(props: { open: boolean; onToggle: () => void }) {
  const { open, onToggle } = props;
  return (
    <Box bg="bg.subtle" py={1} px={1}>
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={3}>
          <IconButton
            aria-label="Toggle Menu"
            variant="outline"
            colorScheme="whiteAlpha"
            onClick={onToggle}
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
      width={{ base: open ? "200px" : "0" }}
      transition="width 0.2s"
      overflow="hidden"
      bg="bg.subtle"
    >
      <VStack align="stretch" gap={2} p={4}>
        <Button variant="ghost" onClick={onToggle} asChild>
          <Link to="/dashboard">Dashboard</Link>
        </Button>
        <Button variant="ghost" onClick={onToggle} asChild>
          <Link to="/profile">Profile</Link>
        </Button>
        <Button variant="ghost" onClick={onToggle} asChild>
          <Link to="/settings">Setting</Link>
        </Button>
      </VStack>
    </Box>
  );
}

function Home({ connected }: { connected: boolean }) {
  return (
    <>
      <Heading size="lg" mb={4}>
        Welcome to Back Office Ops.
      </Heading>
      <p>We are {connected ? "connected." : "connecting ..."}</p>
      <p>This is the main content area.</p>
    </>
  );
}

function Settings() {
  return (
    <>
      <Heading size="lg" mb={4}>
        Settings
      </Heading>
      <p>This is the main settings area.</p>
    </>
  );
}

function Profile() {
  return (
    <>
      <Heading size="lg" mb={4}>
        Profile
      </Heading>
      <p>This is the main profile area.</p>
    </>
  );
}

function NotFoundPage() {
  return (
    <>
      <Heading size="lg" mb={4}>
        Not Found
      </Heading>
      <p>This page does not exist.</p>
    </>
  );
}

function MainContent(props: { connected: boolean }) {
  const { connected } = props;
  return (
    <Routes>
      <Route path="/" element={<Home connected={connected} />} />
      <Route path="/dashboard" element={<Home connected={connected} />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
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
