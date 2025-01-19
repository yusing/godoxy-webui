"use client";

import { useAuth } from "@/components/auth";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { login } from "@/types/auth"; // Import the login function
import { Box, Card, Group, Input, Stack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React from "react";

// TODO: make a logo
export default function LoginPage() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [authed, setAuthed] = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (authed) {
      router.back();
    }
  }, [authed, router]);

  function toggleVisibility() {
    setIsVisible(!isVisible);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const response = await login({ username, password });

    if (response.ok) {
      setAuthed(true);
      router.back();
    } else {
      setErrorMessage(await response.text());
    }
  }

  return (
    <Box
      w="100vw"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Card.Root width={"500px"}>
        <Card.Header>
          {/* <Logo />  */}
          <Card.Title fontWeight={"bold"} fontSize={"xl"}>
            GoDoxy Login
          </Card.Title>
        </Card.Header>
        <Card.Body gap="4">
          <Stack gap="4" w="full">
            <Field label="Username">
              <Input
                required
                fontSize={"medium"}
                name="username"
                placeholder="Username"
                type="text"
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>
            <Field
              label="Password"
              errorText={errorMessage}
              invalid={errorMessage !== ""}
            >
              <Group attached w="full">
                <Input
                  required
                  fontSize={"medium"}
                  name="password"
                  placeholder="Password"
                  type={isVisible ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  aria-label="toggle password visibility"
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-default-400 pointer-events-none text-2xl" />
                  ) : (
                    <EyeFilledIcon className="text-default-400 pointer-events-none text-2xl" />
                  )}
                </Button>
              </Group>
            </Field>
            <Button w="full" type="submit" onSubmit={handleSubmit}>
              Login
            </Button>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
