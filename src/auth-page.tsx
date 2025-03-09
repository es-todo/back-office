import {
  Box,
  Button,
  Center,
  Heading,
  Input,
  Link,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";

export function LoginPage() {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here (API call, etc.)
    console.log("login form submitted");
  };
  return (
    <Center minH="100vh" p={4}>
      <VStack as="form" gap={4} onSubmit={handleLogin}>
        <Heading size="lg">Welcome to the back office.</Heading>
        <Text fontSize="sm" color="gray.500">
          Please sign in to your account
        </Text>
        <FormControl id="login-email" isRequired>
          <FormLabel>Email address</FormLabel>
          <Input type="email" placeholder="Enter your email" />
        </FormControl>
        <FormControl id="login-password" isRequired>
          <FormLabel>Password</FormLabel>
          <Input type="password" placeholder="Enter your password" />
        </FormControl>
        <Button type="submit" width="full" mt={4}>
          Sign In
        </Button>
        {false && (
          <Box textAlign="center">
            <Link color="blue.500" href="#forgot-password">
              Forgot password?
            </Link>
          </Box>
        )}
      </VStack>
    </Center>
  );
}

export function RegisterPage() {
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here (API call, etc.)
    console.log("register form submitted");
  };

  return (
    <Center minH="100vh" p={4}>
      <VStack as="form" gap={4} onSubmit={handleRegister}>
        <Heading size="lg">Create An Account</Heading>

        <FormControl id="register-name" isRequired>
          <FormLabel>Full Name</FormLabel>
          <Input type="text" placeholder="Enter your full name" />
        </FormControl>

        <FormControl id="register-email" isRequired>
          <FormLabel>Email address</FormLabel>
          <Input type="email" placeholder="Enter your email" />
        </FormControl>

        <FormControl id="register-password" isRequired>
          <FormLabel>Password</FormLabel>
          <Input type="password" placeholder="Create a password" />
        </FormControl>

        <FormControl id="register-password-confirm" isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <Input type="password" placeholder="Confirm your password" />
        </FormControl>

        <Button type="submit" width="full" mt={4}>
          Register
        </Button>
      </VStack>
    </Center>
  );
}
