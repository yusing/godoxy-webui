import { ConfigFile } from "@/types/file";
import { createContext, useContext } from "react";

export interface ConfigFileContextType {
  current: ConfigFile;
  setCurrent: React.Dispatch<React.SetStateAction<ConfigFile>>;
  content: string | undefined;
  setContent: React.Dispatch<React.SetStateAction<string | undefined>>;
  updateRemote: () => void;
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
