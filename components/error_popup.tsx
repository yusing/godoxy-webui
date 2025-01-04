"use client";

import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";

import { FetchError } from "@/types/endpoints";
import { CodeViewer } from "./code_viewer";

export default function ErrorPopup({
  error,
  isOpen,
  setIsOpen,
}: Readonly<{
  error: FetchError | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>) {
  const { onClose, onOpenChange } = useDisclosure();

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setIsOpen(false);
      }}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              HTTP Error {error?.status} - {error?.statusText}
            </ModalHeader>
            <ModalBody className="overflow-y-scroll max-w-full">
              <CodeViewer value={error?.content ?? ""} />
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose}>Close</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
