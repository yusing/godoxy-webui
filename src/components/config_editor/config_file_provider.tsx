import Endpoints, { fetchEndpoint, toastError } from "@/types/api/endpoints";
import { ConfigFile, ConfigFileContext, godoxyConfig } from "@/types/file";
import React from "react";
import { Toaster } from "../ui/toaster";

export const ConfigFileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [content, setContent] = React.useState<string | undefined>(undefined);
  const [current, setCurrent] = React.useState<ConfigFile>(godoxyConfig);

  React.useEffect(() => {
    if (current.isNewFile) {
      setContent("");
      return;
    }
    fetchEndpoint(Endpoints.FileContent(current.type, current.filename))
      .then((r) => r?.text() ?? undefined)
      .then((content) => setContent(content))
      .catch((e: Error) => {
        setContent(undefined);
        toastError(e);
      });
  }, [current.filename]);

  const updateRemote = React.useCallback(() => {
    fetchEndpoint(Endpoints.FileContent(current.type, current.filename), {
      method: "PUT",
      body: content,
      headers: {
        "Content-Type": "application/yaml",
      },
    }).catch(toastError);
  }, [current.filename, content]);

  return (
    <ConfigFileContext.Provider
      value={React.useMemo(
        () => ({
          current,
          setCurrent,
          content,
          setContent,
          updateRemote,
        }),
        [current, content, updateRemote],
      )}
    >
      <Toaster />
      {children}
    </ConfigFileContext.Provider>
  );
};
