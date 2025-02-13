"use client";

import { useCallback, useEffect, useState } from "react";

import ConfigFileActions from "@/components/config_editor/actions";
import UIEditor from "@/components/config_editor/ui_editor";
import YAMLConfigEditor from "@/components/config_editor/yaml_editor";
import { ErrorPopup, useFetchError } from "@/components/error_popup";
import { type GoDoxyError, GoDoxyErrorText } from "@/components/godoxy_error";
import { ListboxSection } from "@/components/listbox/listbox_section";
import { useConfigFileContext } from "@/hooks/config_file";
import type { ConfigFileType } from "@/types/api/endpoints";
import Endpoints from "@/types/api/endpoints";
import {
  type ConfigFile,
  getConfigFiles,
  placeholderFiles,
} from "@/types/file";
import { Box, Center, For, Spinner, Stack } from "@chakra-ui/react";
import { FaFile } from "react-icons/fa6";
import { useAsync } from "react-use";

export default function ConfigEditorPage() {
  const cfgFile = useConfigFileContext();
  const [files, setFiles] = useState(placeholderFiles);
  const { error, setError } = useFetchError();

  const createFile = useCallback((type: ConfigFileType, filename: string) => {
    const newFile = { type: type, filename: filename, isNewFile: true };
    files[type].reverse();
    files[type].push(newFile);
    files[type].reverse();
    cfgFile.setCurrent(newFile);
  }, []);

  useEffect(() => {
    getConfigFiles().then(setFiles).catch(setError);
  }, []);

  const validationErr = useAsync(async () => {
    const resp = await fetch(Endpoints.FileValidate(cfgFile.current.type), {
      method: "POST",
      body: cfgFile.content,
    });
    if (resp.ok) {
      return undefined;
    } else {
      return (await resp.json()) as GoDoxyError;
    }
  }, [cfgFile.content]);

  if (!cfgFile.current) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  return (
    <Stack gap="0" direction="row" h="full">
      <ErrorPopup error={error} setError={setError} />
      <Stack align={"flex-start"} px="4">
        <ConfigFileActions
          checkExists={(t, name) => files[t].some((f) => f.filename === name)}
          createFile={createFile}
        />
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
                  isSelected: f.filename === cfgFile.current.filename,
                  onClick: () => cfgFile.setCurrent(f),
                  ariaLabel: f.filename,
                })}
              </ListboxSection>
            )}
          </For>
        </Box>
      </Stack>
      <Box
        w={"45%"}
        brightness={"10%"}
        overflow={"auto"}
        pr="6"
        scrollbar={"hidden"}
      >
        <UIEditor ctx={cfgFile} />
      </Box>
      <Stack w="55%" overflow="auto" fontSize="sm">
        <YAMLConfigEditor ctx={cfgFile} />
        {validationErr.value && (
          <Box
            as="pre"
            p="2"
            overflow="auto"
            w="full"
            minH="30%"
            filter={"brightness(120%)"}
            border={"1px solid"}
            borderColor="border.error"
          >
            <GoDoxyErrorText err={validationErr.value} />
          </Box>
        )}
      </Stack>
    </Stack>
  );
}
