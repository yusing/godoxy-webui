"use client";

import { ConfigFileProvider } from "@/components/config_editor/config_file_provider";
import React from "react";

const ConfigEditorLayout: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => <ConfigFileProvider>{children}</ConfigFileProvider>;

export default ConfigEditorLayout;
