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
          setCurrent,
          content,
          setContent,
          files: files.value ?? placeholderFiles,
        }),
        [current, content, files],
      )}
    >
      <Toaster />
      {children}
    </ConfigFileContext.Provider>
  );
};

export function updateRemote(current: ConfigFile, content: string) {
  fetchEndpoint(Endpoints.fileContent(current.type, current.filename), {
    method: "PUT",
    body: content,
    headers: {
      "Content-Type": "application/yaml",
    },
  })
    .then(() =>
      toaster.success({
        title: "File saved",
        description: current.filename,
      }),
    )
    .catch(toastError);
}
