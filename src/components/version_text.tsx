"use client";

import { useState } from "react";

import Endpoints, { fetchEndpoint, toastError } from "@/types/api/endpoints";
import { Text } from "@chakra-ui/react";
import { useEffectOnce } from "react-use";

export default function VersionText() {
  const [version, setVersion] = useState("");

  useEffectOnce(() => {
    fetchEndpoint(Endpoints.VERSION)
      .then((response) => response?.text() ?? "unknown")
      .then((text) => setVersion(text))
      .catch((error) => toastError(error));
  });

  return version && <Text>{version}</Text>;
}
