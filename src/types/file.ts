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
