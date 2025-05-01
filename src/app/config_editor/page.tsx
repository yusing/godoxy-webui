"use client";

import { NewFileButton, SaveButton } from "@/components/config_editor/actions";
import UIEditor from "@/components/config_editor/ui_editor";
import YAMLConfigEditor from "@/components/config_editor/yaml_editor";
import { GoDoxyErrorText } from "@/components/godoxy_error";
import { ListboxSection } from "@/components/listbox/listbox_section";
import { Toaster } from "@/components/ui/toaster";
import { useConfigFileState } from "@/hooks/config_file";
import { type ConfigFile } from "@/types/file";
import { Box, For, Stack } from "@chakra-ui/react";
import { FaFile } from "react-icons/fa6";
import { useEffectOnce } from "react-use";

export default function ConfigEditorPage() {
  return (
    <Stack gap="0" direction="row" h="full">
      <Stack align={"flex-start"} px="4">
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
      <Stack minW="40%" overflow="auto" fontSize="sm">
        <YAMLConfigEditor />
        <ValidationErrorText />
      </Stack>
      <ConfigStateInitializer />
      <Toaster />
    </Stack>
  );
}

function FileList() {
  const { files, current, setCurrent } = useConfigFileState();
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
  const { valErr } = useConfigFileState();
  if (!valErr) {
    return null;
  }
  return <GoDoxyErrorText err={valErr} />;
}

function ConfigStateInitializer() {
  const { init } = useConfigFileState();
  useEffectOnce(() => {
    init();
  });
  return null;
}
