"use client";

import { useState } from "react";

import { api } from "@/lib/api-client";
import { Text } from "@chakra-ui/react";
import { useEffectOnce } from "react-use";

export default function VersionText() {
  const [version, setVersion] = useState("");

  useEffectOnce(() => {
    api.version.version().then(({ data }) => setVersion(data ?? "unknown"));
  });

  return version && <Text>{version}</Text>;
}
