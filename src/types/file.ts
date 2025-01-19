import { ValidateFunction } from "ajv";
import React from "react";
import Endpoints, { type ConfigFileType, fetchEndpoint } from "./api/endpoints";

export type ConfigFile = {
  type: ConfigFileType;
  filename: string;
  isNewFile?: boolean;
};

export type ConfigFiles = Record<ConfigFileType, ConfigFile[]>;

export const godoxyConfig: ConfigFile = {
  type: "config",
  filename: "config.yml",
};
export const placeholderFiles: ConfigFiles = {
  config: [],
  provider: [],
  middleware: [],
};

export async function getConfigFiles() {
  return await fetchEndpoint(Endpoints.LIST_FILES)
    .then((r) => r?.json() ?? {})
    .then((files: Record<string, string[]>) => {
      return Object.entries(files).reduce((acc, [fileType, filenames]) => {
        const t = fileType as ConfigFileType;
        acc[t] = filenames.map((f) => ({ type: t, filename: f }));
        return acc;
      }, {} as ConfigFiles);
    });
}

export type Schema = {
  type: ConfigFileType;
  schema?: JSON;
  validate?: ValidateFunction;
};

export interface ConfigFileContextType {
  curFile: ConfigFile;
  setCurFile: React.Dispatch<React.SetStateAction<ConfigFile>>;
  content: string | undefined;
  setContent: React.Dispatch<React.SetStateAction<string | undefined>>;
  updateRemote: () => void;
}

export interface ConfigSchemaContextType {
  schema: Schema;
  setType: (type: ConfigFile["type"]) => void;
}

export const ConfigFileContext = React.createContext<
  ConfigFileContextType | undefined
>(undefined);

export const ConfigSchemaContext = React.createContext<ConfigSchemaContextType>(
  {
    schema: { type: "config" },
    setType: () => {},
  },
);

export const useConfigFileContext = () => {
  const context = React.useContext(ConfigFileContext);
  if (!context) {
    throw new Error(
      "useConfigFileContext must be used within a ConfigFileProvider",
    );
  }
  return context;
};

export const useConfigSchemaContext = () => {
  const context = React.useContext(ConfigSchemaContext);
  if (!context) {
    throw new Error(
      "useConfigSchemaContext must be used within a ConfigSchemaProvider",
    );
  }
  return context;
};
