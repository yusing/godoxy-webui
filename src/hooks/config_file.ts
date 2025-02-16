import { ConfigFileType } from "@/types/api/endpoints";
import { ConfigFile } from "@/types/file";
import { createContext, useContext } from "react";

export interface ConfigFileContextType {
  current: ConfigFile;
  setCurrent: (file: ConfigFile) => void;
  content: string | undefined;
  setContent: (content: string | undefined) => void;
  files: Record<ConfigFileType, ConfigFile[]>;
}

export const ConfigFileContext = createContext<
  ConfigFileContextType | undefined
>(undefined);

export const useConfigFileContext = () => {
  const context = useContext(ConfigFileContext);
  if (!context) {
    throw new Error(
      "useConfigFileContext must be used within a ConfigFileProvider",
    );
  }
  return context;
};
