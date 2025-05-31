import { ListboxItem } from "@/components/listbox/listbox_item";
import { type ConfigFileType } from "@/types/api/endpoints";
import path from "path";
import { MdAdd, MdSave } from "react-icons/md";

import { Field } from "@/components/ui/field";
import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  RadioCardItem,
  RadioCardLabel,
  RadioCardRoot,
} from "@/components/ui/radio-card";
import { useConfigFileState } from "@/hooks/config_file";
import { ConfigFile } from "@/types/file";
import { Group, Input, InputAddon } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { GrCloudSoftware, GrDocumentConfig } from "react-icons/gr";

interface FormProps {
  fileExtension: string;
}

export function NewFileButton({ fileExtension }: FormProps) {
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [fileType, setFileType] = useState<ConfigFileType>("provider");
  const [isOpen, setIsOpen] = useState(false);
  const { files, setCurrent } = useConfigFileState();

  const checkExists = useCallback(
    (t: ConfigFileType, v: string) => {
      return files[t].some((f) => f.filename === v);
    },
    [files],
  );

  const validate = useCallback(
    (t: ConfigFileType, v: string) => {
      setFilename(v);
      if (v.length === 0) {
        setError("File name cannot be empty");
      } else if (path.basename(v) !== v) {
        setError("File name cannot contain path separators");
      } else if (v.indexOf(".") !== -1) {
        setError("File name cannot contain '.'");
      } else if (checkExists(t, v + fileExtension)) {
        setError("File already exists");
      } else {
        setError(null);
      }
    },
    [checkExists],
  );

  return (
    <PopoverRoot
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
      positioning={{
        placement: "bottom-start",
      }}
      lazyMount
      unmountOnExit
    >
      <PopoverTrigger asChild>
        <ListboxItem
          icon={<MdAdd />}
          text="New File"
          aria-label="New File"
          colorPalette="fg"
          px={0}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>
          <RadioCardRoot
            defaultValue={fileType}
            value={fileType}
            orientation="horizontal"
            onValueChange={(t) => {
              setFileType(t.value as ConfigFileType);
              validate(t.value as ConfigFileType, filename);
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
                    const newFile: ConfigFile = {
                      type: fileType,
                      filename: filename + ".yml",
                      isNewFile: true,
                    };
                    setCurrent(newFile);
                    files[fileType].unshift(newFile);
                    setIsOpen(false);
                  }
                  if (e.key === "Escape") {
                    setIsOpen(false);
                  }
                }}
              />
              <InputAddon>{fileExtension}</InputAddon>
            </Group>
          </Field>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
}

export function SaveButton() {
  const { hasUnsavedChanges, updateRemote } = useConfigFileState();
  return (
    <ListboxItem
      px={0}
      colorPalette={hasUnsavedChanges ? "green" : "fg"}
      disabled={!hasUnsavedChanges}
      aria-label="Save File"
      icon={<MdSave />}
      text="Save File"
      onClick={updateRemote}
    />
  );
}
