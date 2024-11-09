"use client";

import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { EyeFilledIcon } from "@/components/eye_filled_icon";
import { EyeSlashFilledIcon } from "@/components/eye_slash_filled_icon";
import { login } from "@/types/auth"; // Import the login function
import { Logo } from "@/components/icons";

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  function toggleVisibility() {
    setIsVisible(!isVisible);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const response = await login({ username, password });

    if (response.ok) {
      router.push("/");
    } else {
      setErrorMessage(await response.text());
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <Card className="w-full max-w-xs sm:max-w-md lg:min-w-[400px] p-4" radius="sm">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-center text-center">
          <Logo />
          <span className="font-bold text-inherit flex">GoDoxy</span>
          <h4 className="text-large font-bold">Login</h4>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardBody className="gap-4">
            <Input
              isRequired
              classNames={{ label: "font-medium" }}
              label="Username"
              labelPlacement="outside"
              name="username"
              placeholder="Username"
              radius="sm"
              type="text"
              variant="bordered"
              onValueChange={setUsername}
            />
            <Input
              isRequired
              classNames={{ label: "font-medium" }}
              endContent={
                <button
                  aria-label="toggle password visibility"
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              errorMessage={errorMessage}
              isInvalid={errorMessage !== ""}
              label="Password"
              labelPlacement="outside"
              name="password"
              placeholder="Password"
              radius="sm"
              type={isVisible ? "text" : "password"}
              variant="bordered"
              onValueChange={setPassword}
            />
            <Button className="w-full" radius="sm" type="submit" variant="flat">
              Login
            </Button>
          </CardBody>
        </form>
      </Card>
    </div>
  );
}
