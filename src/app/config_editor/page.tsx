"use client";

import { useCallback, useEffect, useState } from "react";

import ConfigFileActions from "@/components/config_editor/actions";
import { ErrorPopup, useFetchError } from "@/components/error_popup";
import { ListboxSection } from "@/components/listbox/listbox";
import type { ConfigFileType } from "@/types/api/endpoints";
import {
  type ConfigFile,
  getConfigFiles,
  placeholderFiles,
  useConfigFileContext,
  useConfigSchemaContext,
} from "@/types/file";
import { Box, For, Stack, VStack } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { FaFile } from "react-icons/fa6";

const ConfigEditor = dynamic(
  () => import("@/components/config_editor/editor"),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  },
);

export default function ConfigEditorPage() {
  const [files, setFiles] = useState(placeholderFiles);
  const { curFile, setCurFile } = useConfigFileContext();
  const { setType } = useConfigSchemaContext();
  const { error, setError } = useFetchError();

  useEffect(() => {
    getConfigFiles().then(setFiles).catch(setError);
  }, [setError]);

  const createFile = useCallback(
    (type: ConfigFileType, filename: string) => {
      const newFile = { type: type, filename: filename, isNewFile: true };
      files[type].reverse();
      files[type].push(newFile);
      files[type].reverse();
      setCurFile(newFile);
    },
    [files, setCurFile],
  );

  return (
    <Stack gap="6" direction="row">
      <ErrorPopup error={error} setError={setError} />
      <VStack justify="space-between" align={"flex-start"}>
        <Box gap="4">
          <For each={Object.entries(files)}>
            {([fileType, files]) => (
              <ListboxSection
                key={fileType}
                title={`${fileType[0]!.toUpperCase()}${fileType.slice(1)} files`}
                items={files}
                py="2"
              >
                {(f: ConfigFile) => ({
                  key: `${fileType}:${f.filename}`,
                  icon: <FaFile />,
                  text: f.filename,
                  isSelected: f.filename === curFile.filename,
                  onPress: () => {
                    setCurFile(f);
                    setType(f.type);
                  },
                  ariaLabel: f.filename,
                })}
              </ListboxSection>
            )}
          </For>
        </Box>
        <ConfigFileActions
          checkExists={(t, name) => files[t].some((f) => f.filename === name)}
          createFile={createFile}
        />
      </VStack>
      <ConfigEditor />

      {/* <Tabs.RootProvider value={tabs}>
          <Tabs.List gap="6">
            <Tabs.Trigger value="yaml">YAML</Tabs.Trigger>
            <Tabs.Trigger value="ui">UI</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="yaml">
            <ConfigEditor />
          </Tabs.Content>
          <Tabs.Content value="ui">
            <UIEditor />
          </Tabs.Content>
        </Tabs.RootProvider> */}
    </Stack>
  );
}
