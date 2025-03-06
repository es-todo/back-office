import { Box, Button, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export function SideMenu({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
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
