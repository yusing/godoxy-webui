"use client";

import { FetchError } from "@/types/api/endpoints";
import { Heading, Text } from "@chakra-ui/react";
import React from "react";
import { CloseButton } from "./ui/close-button";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "./ui/dialog";

export function useFetchError() {
  const [error, setError] = React.useState<FetchError | null>(null);
  return { error, setError };
}

export function ErrorPopup({
  error,
  setError,
}: Readonly<ReturnType<typeof useFetchError>>) {
  return (
    <DialogRoot
      placement={"center"}
      size="lg"
      open={error !== null}
      onExitComplete={() => setError(null)}
      onOpenChange={(e) => setError(e.open ? error : null)}
    >
      <DialogContent>
        <DialogHeader>
          <Heading size="lg" fontWeight={"bold"}>
            HTTP Error {error?.status}
            {error?.statusText && ` - ${error?.statusText}`}
          </Heading>
        </DialogHeader>
        <DialogBody>
          <Text>{error?.message ?? "No content"}</Text>
        </DialogBody>
        <DialogFooter>
          <CloseButton onClick={() => setError(null)} />
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
