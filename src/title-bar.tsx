import { Box, Flex, Heading, IconButton } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons/Hamburger";
import { CloseIcon } from "@chakra-ui/icons/Close";

export function TitleBar(props: { open: boolean; onToggle: () => void }) {
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
