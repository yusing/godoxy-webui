"use client";

import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Toaster } from "@/components/ui/toaster";
import { type FetchError, login } from "@/types/api/endpoints"; // Import the login function
import { Card, Fieldset, Group, IconButton, Input } from "@chakra-ui/react";
import { useState } from "react";
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
    formState: { errors },
  } = useForm<FormValues>();

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
    <form onSubmit={onSubmit}>
      <Toaster />
      <Card.Root>
        <Card.Body>
          <Fieldset.Root size="lg" minW={"sm"} maxW={"md"}>
            <Fieldset.Legend>GoDoxy Login</Fieldset.Legend>
            <Fieldset.Content>
              <Field
                label="Username"
                invalid={!!errors.username}
                errorText={errors.username?.message}
              >
                <Input
                  p="1"
                  fontSize={"medium"}
                  {...register("username", {
                    required: "Username is required",
                  })}
                />
              </Field>
              <Field
                label="Password"
                invalid={!!errors.password || !!errorMessage}
                errorText={errors.password?.message ?? errorMessage}
              >
                <Group attached w="full">
                  <Input
                    p="1"
                    fontSize={"medium"}
                    type={isVisible ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                  <IconButton
                    aria-hidden
                    type="button"
                    variant={"subtle"}
                    onClick={toggleVisibility}
                  >
                    {isVisible ? <EyeSlashFilledIcon /> : <EyeFilledIcon />}
                  </IconButton>
                </Group>
              </Field>
            </Fieldset.Content>
            <Button type="submit" variant={"subtle"}>
              Login
            </Button>
          </Fieldset.Root>
        </Card.Body>
      </Card.Root>
    </form>
  );
}
