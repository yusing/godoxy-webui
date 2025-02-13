"use client";

import { ConfigFileProvider } from "@/components/config_editor/config_file_provider";
import type { FC, PropsWithChildren } from "react";

const ConfigEditorLayout: FC<PropsWithChildren> = ({ children }) => (
  <ConfigFileProvider>{children}</ConfigFileProvider>
);

export default ConfigEditorLayout;
