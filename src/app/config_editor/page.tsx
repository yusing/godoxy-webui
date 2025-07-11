"use client";

import { NewFileButton, SaveButton } from "@/components/config_editor/actions";
import UIEditor from "@/components/config_editor/ui_editor";
import YAMLConfigEditor from "@/components/config_editor/yaml_editor";
import { GoDoxyErrorText } from "@/components/godoxy_error";
import { ListboxSection } from "@/components/listbox/listbox_section";
import { Toaster } from "@/components/ui/toaster";
import {
  initUseConfigFileState,
  useConfigFileState,
} from "@/hooks/config_file";
import { type ConfigFile } from "@/types/file";
import { Box, For, Stack } from "@chakra-ui/react";
import { FaFile } from "react-icons/fa6";
import { useMount } from "react-use";
import { useShallow } from "zustand/react/shallow";

export default function ConfigEditorPage() {
  return (
    <Stack gap="6" direction="row" h="full" w="full">
      <ConfigStateInitializer />
      <Stack align={"flex-start"}>
        <Stack gap="0">
          <NewFileButton fileExtension=".yml" />
          <SaveButton />
        </Stack>
        <FileList />
      </Stack>
      <Box
        w={"full"}
        brightness={"10%"}
        overflow={"auto"}
        pr="6"
        scrollbar={"hidden"}
      >
        <UIEditor />
      </Box>
      <Stack w="40%" minW="800px" overflow="auto" fontSize="sm">
        <YAMLConfigEditor />
        <ValidationErrorText />
      </Stack>
      <Toaster />
    </Stack>
  );
}

function FileList() {
  const { files, current, setCurrent } = useConfigFileState(
    useShallow((state) => ({
      files: state.files,
      current: state.current,
      setCurrent: state.setCurrent,
    })),
  );
  return (
    <Box gap="3" overflowY="auto" scrollbar={"hidden"}>
      <For each={Object.entries(files)}>
        {([fileType, files]) => (
          <ListboxSection
            key={fileType}
            title={`${fileType[0]!.toUpperCase()}${fileType.slice(1)} files`}
            items={files}
          >
            {(f: ConfigFile) => ({
              key: `${fileType}:${f.filename}`,
              icon: <FaFile />,
              text: f.filename,
              isSelected: f.filename === current.filename,
              onClick: () => setCurrent(f),
              ariaLabel: f.filename,
            })}
          </ListboxSection>
        )}
      </For>
    </Box>
  );
}

function ValidationErrorText() {
  const valErr = useConfigFileState((state) => state.valErr);
  if (!valErr) {
    return null;
  }
  return <GoDoxyErrorText err={valErr} />;
}

function ConfigStateInitializer() {
  useMount(initUseConfigFileState);
  return null;
}
