import Endpoints, { fetchEndpoint, toastError } from "@/types/api/endpoints";
import { ConfigFile, ConfigFileContext, godoxyConfig } from "@/types/file";
import React from "react";
import { Toaster } from "../ui/toaster";
import { ConfigSchemaProvider } from "./schema_provider";

export const ConfigFileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [content, setContent] = React.useState<string | undefined>(undefined);
  const [curFile, setCurFile] = React.useState<ConfigFile>(godoxyConfig);

  React.useEffect(() => {
    if (curFile.isNewFile) {
      setContent("");
      return;
    }
    fetchEndpoint(Endpoints.FileContent(curFile.type, curFile.filename))
      .then((r) => r.text())
      .then((content) => setContent(content))
      .catch((e: Error) => {
        setContent(undefined);
        toastError(e);
      });
  }, [curFile]);

  const updateRemote = React.useCallback(() => {
    fetchEndpoint(Endpoints.FileContent(curFile.type, curFile.filename), {
      method: "PUT",
      body: content,
      headers: {
        "Content-Type": "application/yaml",
      },
    }).catch(toastError);
  }, [curFile, content]);

  return (
    <ConfigFileContext.Provider
      value={React.useMemo(
        () => ({
          curFile,
          setCurFile,
          content,
          setContent,
          updateRemote,
        }),
        [curFile, content, updateRemote],
      )}
    >
      <Toaster />
      <ConfigSchemaProvider>{children}</ConfigSchemaProvider>
    </ConfigFileContext.Provider>
  );
};
