"use client";

import ConfigFileActions from "@/components/config_editor/actions";
import { ConfigFileProvider } from "@/components/config_editor/config_file_provider";
import UIEditor from "@/components/config_editor/ui_editor";
import YAMLConfigEditor from "@/components/config_editor/yaml_editor";
import { type GoDoxyError, GoDoxyErrorText } from "@/components/godoxy_error";
import { ListboxSection } from "@/components/listbox/listbox_section";
import { useConfigFileContext } from "@/hooks/config_file";
import Endpoints from "@/types/api/endpoints";
import { type ConfigFile } from "@/types/file";
import { Box, For, Stack } from "@chakra-ui/react";
import { FaFile } from "react-icons/fa6";
import { useAsync } from "react-use";

export default function ConfigEditorPage() {
  return (
    <ConfigFileProvider>
      <Stack gap="0" direction="row" h="full">
        <Stack align={"flex-start"} px="4">
          <ConfigFileActions />
          <FileList />
        </Stack>
        <Box
          w={"45%"}
          brightness={"10%"}
          overflow={"auto"}
          pr="6"
          scrollbar={"hidden"}
        >
          <UIEditor />
        </Box>
        <Stack w="55%" overflow="auto" fontSize="sm">
          <YAMLConfigEditor />
          <ValidationErrorText />
        </Stack>
      </Stack>
    </ConfigFileProvider>
  );
}

function FileList() {
  const { files, current, setCurrent } = useConfigFileContext();
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
  const { content, current } = useConfigFileContext();
  const validationErr = useAsync(async () => {
    const resp = await fetch(Endpoints.fileValidate(current.type), {
      method: "POST",
      body: content,
    });
    if (resp.ok) {
      return undefined;
    } else {
      return (await resp.json()) as GoDoxyError;
    }
  }, [content, current.type]);

  if (!validationErr.value) {
    return null;
  }
  return <GoDoxyErrorText err={validationErr.value} />;
}
