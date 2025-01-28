import { ConfigFileType as FileType } from "@/types/api/endpoints";
import path from "path";
import { MdAdd, MdSave } from "react-icons/md";
import { ListboxItem } from "../listbox/listbox_item";

import { useConfigFileContext } from "@/types/file";
import { Group, Input, InputAddon, Stack } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { GrCloudSoftware, GrDocumentConfig } from "react-icons/gr";
import { Field } from "../ui/field";
import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "../ui/popover";
import { RadioCardItem, RadioCardLabel, RadioCardRoot } from "../ui/radio-card";

export default function ConfigFileActions({
  checkExists,
  createFile,
}: Readonly<{
  checkExists: (fileType: FileType, filename: string) => boolean;
  createFile: (fileType: FileType, filename: string) => void;
}>) {
  const { updateRemote } = useConfigFileContext();

  return (
    <Stack gap="0">
      <NewFileButton
        fileExtension=".yml"
        checkExists={checkExists}
        onSubmit={(t, name) => createFile(t, name + ".yml")}
      />
      <ListboxItem
        aria-label="Save File"
        icon={<MdSave />}
        text="Save File"
        onClick={updateRemote}
      />
    </Stack>
  );
}

export type FormProps = {
  fileExtension: string;
  checkExists: (fileType: FileType, filename: string) => boolean;
  onSubmit: (fileType: FileType, filename: string) => void;
};

export const NewFileButton: React.FC<FormProps> = ({ ...props }) => {
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [fileType, setFileType] = useState<FileType>("provider");
  const [isOpen, setIsOpen] = useState(false);

  const validate = useCallback(
    (t: FileType, v: string) => {
      setFilename(v);
      if (v.length === 0) {
        setError("File name cannot be empty");
      } else if (path.basename(v) !== v) {
        setError("File name cannot contain path separators");
      } else if (v.indexOf(".") !== -1) {
        setError("File name cannot contain '.'");
      } else if (props.checkExists(t, v + props.fileExtension)) {
        setError("File already exists");
      } else {
        setError(null);
      }
    },
    [props.checkExists],
  );

  return (
    <PopoverRoot
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
      positioning={{
        placement: "bottom-start",
      }}
    >
      <PopoverTrigger asChild>
        <ListboxItem icon={<MdAdd />} text="New File" aria-label="New File" />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>
          <RadioCardRoot
            defaultValue={fileType}
            value={fileType}
            orientation="horizontal"
            onValueChange={(t) => {
              setFileType(t.value as FileType);
              validate(t.value as FileType, filename);
            }}
          >
            <RadioCardLabel>Select file type</RadioCardLabel>
            <RadioCardItem
              icon={<GrDocumentConfig />}
              value="provider"
              label="Include File"
              description="Create custom proxy routes"
            ></RadioCardItem>
            <RadioCardItem
              icon={<GrCloudSoftware />}
              value="middleware"
              label="Middleware compose"
              description="Create reusable middleware objects"
            ></RadioCardItem>
          </RadioCardRoot>
          <Field label="File Name" invalid={error !== null} errorText={error}>
            <Group attached minW="full">
              <Input
                required
                padding={2}
                value={filename}
                onChange={(e) => validate(fileType, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && error === null) {
                    props.onSubmit(fileType, filename);
                    setIsOpen(false);
                  }
                  if (e.key === "Escape") {
                    setIsOpen(false);
                  }
                }}
              />
              <InputAddon>{props.fileExtension}</InputAddon>
            </Group>
          </Field>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};
