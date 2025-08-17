import type { GoDoxyError } from "@/components/godoxy_error";
import { toaster } from "@/components/ui/toaster";
import type { FileType } from "@/lib/api";
import { api, callApi } from "@/lib/api-client";
import { toastError } from "@/lib/toast";
import type { ConfigFile, ConfigFiles } from "@/types/file";
import { godoxyConfig } from "@/types/file";
import { Config } from "@/types/godoxy";
import { AxiosError } from "axios";
import { parse as parseYAML, stringify as stringifyYAML } from "yaml";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type State = {
  files: Record<FileType, ConfigFile[]>;
  content: string | null;
  current: ConfigFile;
  hasUnsavedChanges: boolean;
  valErr: GoDoxyError | null;
  setCurrent: (file: ConfigFile) => Promise<void>;
  setContent: (content: string | null) => Promise<void>;
  updateRemote: () => void;
  addAgent: (host: string, port: number) => Promise<void>;
};

async function getContent(file: ConfigFile): Promise<string | null> {
  if (file.isNewFile) {
    return templateByType(file.type);
  }
  const { data } = await callApi(api.file.get, {
    filename: file.filename,
    type: file.type,
  });
  return data;
}

async function validate(
  file: ConfigFile,
  content: string,
): Promise<GoDoxyError | null> {
  try {
    await api.file.validate({ type: file.type }, content);
    return null;
  } catch (e) {
    if (e instanceof AxiosError) {
      return e.response?.data;
    }
    return null;
  }
}

async function updateRemote(file: ConfigFile, content: string): Promise<void> {
  await api.file
    .set(
      {
        filename: file.filename,
        type: file.type,
      },
      content,
    )
    .then(() =>
      toaster.create({
        title: "File saved successfully",
      }),
    )
    .catch(toastError);
}

export const useConfigFileState = create<State>((set, get) => ({
  files: {
    config: [],
    provider: [],
    middleware: [],
  },
  content: null,
  current: godoxyConfig,
  hasUnsavedChanges: false,
  valErr: null,
  setContent: async (content: string | null) => {
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
      valErr: null,
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
      valErr: null,
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
  const { data } = await callApi(api.file.list);
  if (!data) {
    return;
  }
  const files = Object.entries(data).reduce((acc, [type, filenames]) => {
    acc[type as FileType] = filenames.map((f: string) => ({
      type: type,
      filename: f,
    }));
    return acc;
  }, {} as ConfigFiles);
  const content = await getContent(godoxyConfig);
  useConfigFileState.setState({
    files,
    content,
    hasUnsavedChanges: false,
  });
}

export function templateByType(type: FileType) {
  switch (type) {
    case "provider":
      return routeFileTemplate;
    case "middleware":
      return middlewareFileTemplate;
    default:
      return "";
  }
}

const routeFileTemplate = `example: # matching "example.domain.com"
  scheme: http
  host: 10.0.0.254
  port: 80
  healthcheck:
    disabled: false
    path: /health
    interval: 5s
  load_balance:
    link: app
    mode: ip_hash
    options:
      header: X-Forwarded-For
  middlewares:
    cidr_whitelist:
      allow:
        - 127.0.0.1
        - 10.0.0.0/8
      status_code: 403
      message: IP not allowed
    hideXForwarded:
  homepage:
    name: Example App
    icon: "@selfhst/example.png"
    description: An example app
    category: example
  rules:
    - name: default
      do: pass
    - name: api
      on: path /api/*
      do: proxy http://10.0.0.2:8080
    - name: websocket
      on: path /ws/*
      do: proxy http://10.0.0.3:8080
  access_log:
    buffer_size: 8192
    path: /var/log/example.log
    filters:
      status_codes:
        values:
          - 200-299
          - 101
      method:
        values:
          - GET
      host:
        values:
          - example.y.z
      headers:
        negative: true
        values:
          - foo=bar
          - baz
      cidr:
        values:
          - 192.168.10.0/24
    fields:
      headers:
        default: keep
        config:
          foo: redact
      query:
        default: drop
        config:
          foo: keep
      cookies:
        default: redact
        config:
          foo: keep
`;

const middlewareFileTemplate = `middleware1:
  - use: cloudflare_real_ip
  - use: cidr_whitelist
    allow:
      - 127.0.0.1
      - 10.0.0.0/8
    message: You have been blocked
`;
