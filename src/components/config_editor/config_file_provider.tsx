import { ConfigFileContext } from "@/hooks/config_file";
import Endpoints, { fetchEndpoint, toastError } from "@/types/api/endpoints";
import {
  ConfigFile,
  getConfigFiles,
  godoxyConfig,
  placeholderFiles,
} from "@/types/file";
import React from "react";
import { useAsync } from "react-use";
import { toaster, Toaster } from "../ui/toaster";

export const ConfigFileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [content, setContent] = React.useState<string | undefined>(undefined);
  const [current, setCurrent] = React.useState<ConfigFile>(godoxyConfig);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const files = useAsync(getConfigFiles);

  React.useEffect(() => {
    fetchEndpoint(Endpoints.fileContent(current.type, current.filename))
      .then((r) => r?.text() ?? undefined)
      .then((content) => setContent(content))
      .catch((e: Error) => {
        setContent(undefined);
        toastError(e);
      });
  }, [current.filename]);

  React.useEffect(() => {
    if (current.isNewFile) {
      setContent("");
      return;
    }
  }, [current.isNewFile]);

  return (
    <ConfigFileContext.Provider
      value={React.useMemo(
        () => ({
          current,
          setCurrent: (current) => {
            setCurrent(current);
            setHasUnsavedChanges(false);
          },
          content,
          setContent: (content) => {
            setContent(content);
            setHasUnsavedChanges(true);
          },
          updateRemote: (file, content, args) =>
            updateRemote(file, content, { ...args, setHasUnsavedChanges }),
          files: files.value ?? placeholderFiles,
          hasUnsavedChanges,
          setHasUnsavedChanges,
        }),
        [current, content, files, hasUnsavedChanges],
      )}
    >
      <Toaster />
      {children}
    </ConfigFileContext.Provider>
  );
};

async function updateRemote(
  current: ConfigFile,
  content: string,
  props: {
    toast?: boolean;
    setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  },
) {
  await fetchEndpoint(Endpoints.fileContent(current.type, current.filename), {
    method: "PUT",
    body: content,
    headers: {
      "Content-Type": "application/yaml",
    },
  })
    .then(
      () =>
        props.toast &&
        toaster.create({
          title: "File saved",
          description: current.filename,
        }),
    )
    .catch(toastError)
    .finally(() => props.setHasUnsavedChanges(false));
}
