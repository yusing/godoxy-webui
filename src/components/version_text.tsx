"use client";

import { useEffect, useState } from "react";

import Endpoints, { fetchEndpoint, toastError } from "@/types/api/endpoints";
import { Text } from "@chakra-ui/react";

export default function VersionText() {
  const [version, setVersion] = useState("");

  useEffect(() => {
    fetchEndpoint(Endpoints.VERSION)
      .then((response) => response.text())
      .then((text) => setVersion(text))
      .catch((error) => toastError(error));
  }, []);

  return (
    version && (
      <Text>
        {version}
      </Text>
    )
  );
}
