import { GoDoxyError } from "@/components/godoxy_error";
import { toaster } from "@/components/ui/toaster";
import { templateByType } from "@/lib/api/config";
import Endpoints, {
  ConfigFileType,
  fetchEndpoint,
  toastError,
} from "@/types/api/endpoints";
import { ConfigFile, getConfigFiles, godoxyConfig } from "@/types/file";
import { create } from "zustand";
type State = {
  files: Record<ConfigFileType, ConfigFile[]>;
  content: string | undefined;
  current: ConfigFile;
  hasUnsavedChanges: boolean;
  valErr: GoDoxyError | undefined;
  init: () => Promise<void>;
  setCurrent: (file: ConfigFile) => Promise<void>;
  setContent: (content: string | undefined) => void;
  updateRemote: () => void;
};

export const useConfigFileState = create<State>((set, get) => ({
  files: {
    config: [],
    provider: [],
    middleware: [],
  },
  content: undefined,
  current: godoxyConfig,
  hasUnsavedChanges: false,
  init: async () => {
    const files = await getConfigFiles();
    const content = await fetchEndpoint(
      Endpoints.fileContent(godoxyConfig.type, godoxyConfig.filename),
    )
      .then((r) => r?.text() ?? undefined)
      .catch((e) => {
        toastError(e);
        return undefined;
      });
    set({ files, content, hasUnsavedChanges: false });
  },
  setContent: async (content: string | undefined) => {
    const validateErr = await fetch(
      Endpoints.fileValidate(get().current.type),
      {
        method: "POST",
        body: content,
      },
    )
      .then(async (r) => {
        if (r?.ok) {
          return undefined;
        }
        return (await r?.json()) as GoDoxyError | undefined;
      })
      .catch(() => undefined);
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
    const content = await fetchEndpoint(
      Endpoints.fileContent(file.type, file.filename),
    )
      .then((r) => r?.text() ?? undefined)
      .catch((e) => {
        toastError(e);
        return undefined;
      });
    return set({ current: file, content, hasUnsavedChanges: false });
  },
  updateRemote: () => {
    set((state) => {
      if (!state.content) {
        return state;
      }
      fetchEndpoint(
        Endpoints.fileContent(state.current.type, state.current.filename),
        {
          method: "PUT",
          body: state.content,
        },
      )
        .then(() => {
          toaster.create({
            title: "File saved successfully",
          });
        })
        .catch((e) => {
          toastError(e);
        });
      return {
        ...state,
        hasUnsavedChanges: false,
      };
    });
  },
  valErr: undefined,
}));
