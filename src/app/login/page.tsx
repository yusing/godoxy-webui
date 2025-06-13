"use client";

import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { type FetchError, login } from "@/types/api/endpoints"; // Import the login function
import {
  Box,
  Card,
  Group,
  Heading,
  IconButton,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface FormValues {
  username: string;
  password: string;
}

// TODO: make a logo
export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    setFocus("username");
  }, [setFocus]);

  function toggleVisibility() {
    setIsVisible(!isVisible);
  }

  const onSubmit = handleSubmit(async (data) => {
    await login({
      username: data.username,
      password: data.password,
      toastAuthError: false,
    })
      .then(() => (window.location.href = "/"))
      .catch((e: FetchError) => {
        setErrorMessage(e.message);
      });
  });

  return (
    <>
      <Box textAlign="center" mb={8}>
        {/* Placeholder for Logo */}
        <Heading as="h1" size="2xl" color="fg" opacity={0.9}>
          GoDoxy
        </Heading>
        <Text color="fg" opacity={0.7}>
          Beyond a reverse proxy
        </Text>
      </Box>
      <form onSubmit={onSubmit}>
        <Card.Root
          shadow="2xl" // Enhanced shadow
          rounded="xl" // Increased border radius
          bg="whiteAlpha.100" // Subtle background for the card
          backdropFilter="blur(10px)" // Frosted glass effect
          borderWidth="1px"
          borderColor="whiteAlpha.300"
        >
          <Card.Body p={10}>
            {" "}
            {/* Increased padding */}
            <Heading
              as="h2"
              size="lg"
              textAlign="center"
              mb={8}
              color="fg"
              opacity={0.9}
            >
              Login to Your Account
            </Heading>
            <VStack gap={6} align="stretch">
              {" "}
              {/* Using VStack for better spacing control */}
              <Field
                label={
                  <Text color="fg" opacity={0.9}>
                    Username
                  </Text>
                }
                invalid={!!errors.username}
                errorText={errors.username?.message}
              >
                <Input
                  p="2.5" // Adjusted padding
                  fontSize={"md"} // Adjusted font size
                  bg="whiteAlpha.200"
                  _hover={{ bg: "whiteAlpha.300" }}
                  _focus={{ bg: "whiteAlpha.300", borderColor: "blue.300" }}
                  color="fg"
                  opacity={0.9}
                  {...register("username", {
                    required: "Username is required",
                  })}
                />
              </Field>
              <Field
                label={
                  <Text color="fg" opacity={0.9}>
                    Password
                  </Text>
                }
                invalid={!!errors.password || !!errorMessage}
                errorText={errors.password?.message ?? errorMessage}
              >
                <Group attached w="full">
                  <Input
                    p="2.5" // Adjusted padding
                    fontSize={"md"} // Adjusted font size
                    bg="whiteAlpha.200"
                    _hover={{ bg: "whiteAlpha.300" }}
                    _focus={{ bg: "whiteAlpha.300", borderColor: "blue.300" }}
                    color="fg"
                    opacity={0.9}
                    type={isVisible ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                  <IconButton
                    aria-hidden
                    type="button"
                    variant={"ghost"} // Changed variant
                    color="fg"
                    opacity={0.7}
                    _hover={{ bg: "bg.muted" }}
                    onClick={toggleVisibility}
                  >
                    {isVisible ? <EyeSlashFilledIcon /> : <EyeFilledIcon />}
                  </IconButton>
                </Group>
              </Field>
              <Button
                type="submit"
                colorScheme="blue" // Using a color scheme for better theming
                size="lg" // Larger button
                w="full"
                mt={4} // Adjusted margin top
                _hover={{ bg: "blue.600" }}
              >
                Login
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      </form>
    </>
  );
}
