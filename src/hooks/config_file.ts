import { GoDoxyError } from "@/components/godoxy_error";
import { toaster } from "@/components/ui/toaster";
import { templateByType } from "@/lib/api/config";
import Endpoints, {
  ConfigFileType,
  fetchEndpoint,
  toastError,
} from "@/types/api/endpoints";
import { ConfigFile, getConfigFiles, godoxyConfig } from "@/types/file";
import { Config } from "@/types/godoxy";
import { parse as parseYAML, stringify as stringifyYAML } from "yaml";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type State = {
  files: Record<ConfigFileType, ConfigFile[]>;
  content: string | undefined;
  current: ConfigFile;
  hasUnsavedChanges: boolean;
  valErr: GoDoxyError | undefined;
  setCurrent: (file: ConfigFile) => Promise<void>;
  setContent: (content: string | undefined) => Promise<void>;
  updateRemote: () => void;
  addAgent: (host: string, port: number) => Promise<void>;
};

async function getContent(file: ConfigFile): Promise<string | undefined> {
  if (file.isNewFile) {
    return templateByType(file.type);
  }
  return fetchEndpoint(Endpoints.fileContent(file.type, file.filename))
    .then((r) => r?.text() ?? undefined)
    .catch((e) => {
      toastError(e);
      return undefined;
    });
}

async function validate(
  file: ConfigFile,
  content: string,
): Promise<GoDoxyError | undefined> {
  const res = await fetch(Endpoints.fileValidate(file.type), {
    method: "POST",
    body: content,
  });
  if (res.ok) {
    return undefined;
  }
  return (await res.json()) as GoDoxyError | undefined;
}

async function updateRemote(file: ConfigFile, content: string): Promise<void> {
  return fetchEndpoint(Endpoints.fileContent(file.type, file.filename), {
    method: "PUT",
    body: content,
  })
    .then(() => {
      toaster.create({
        title: "File saved successfully",
      });
    })
    .catch((e) => {
      toastError(e);
    });
}

export const useConfigFileState = create<State>((set, get) => ({
  files: {
    config: [],
    provider: [],
    middleware: [],
  },
  content: undefined,
  current: godoxyConfig,
  hasUnsavedChanges: false,
  valErr: undefined,
  setContent: async (content: string | undefined) => {
    if (!content || content.length === 0) {
      return;
    }
    const { current } = get();
    const validateErr = await validate(current, content);
    set((state) => {
      return {
        ...state,
        content,
        hasUnsavedChanges: true,
        valErr: validateErr,
      };
    });
  },
  setCurrent: async (file: ConfigFile) => {
    if (file.isNewFile) {
      return set({
        current: file,
        content: templateByType(file.type),
        hasUnsavedChanges: true,
      });
    }
    const content = await getContent(file);
    return set({
      current: file,
      content,
      hasUnsavedChanges: false,
      valErr: undefined,
    });
  },
  updateRemote: async () => {
    const { content, valErr } = get();
    if (!content || valErr) {
      return;
    }
    await updateRemote(get().current, content);
    set((state) => ({
      ...state,
      hasUnsavedChanges: false,
    }));
  },
  addAgent: async function (host: string, port: number) {
    const content = await getContent(godoxyConfig);
    if (!content) {
      return;
    }
    const cfg = parseYAML(content) as Config.Config;
    const addr: `${string}:${number}` = `${host}:${port}`;
    if (!cfg.providers) {
      cfg.providers = {
        agents: [addr],
      };
    } else {
      if (!cfg.providers.agents) {
        cfg.providers.agents = [];
      }
      if (!cfg.providers.agents.includes(addr)) {
        cfg.providers.agents.push(addr);
      }
    }
    const cfgYAML = stringifyYAML(cfg);
    const validateErr = await validate(godoxyConfig, cfgYAML);
    if (validateErr) {
      return Promise.reject(validateErr);
    }
    await updateRemote(godoxyConfig, cfgYAML);
    set((state) => ({
      ...state,
      current: godoxyConfig,
      content: cfgYAML,
      hasUnsavedChanges: false,
      valErr: undefined,
    }));
    return;
  },
}));

export function useConfigFileContent() {
  return useConfigFileState(
    useShallow((state) => {
      return {
        content: state.content,
        current: state.current,
        setContent: state.setContent,
      };
    }),
  );
}

export async function initUseConfigFileState() {
  const files = await getConfigFiles();
  const content = await getContent(godoxyConfig);
  useConfigFileState.setState({
    files,
    content,
    hasUnsavedChanges: false,
  });
}
