"use client";

import Endpoints, { fetchEndpoint } from "@/types/api/endpoints";
import { useEffect, useState } from "react";

export function useCheckAuth() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (authed) {
      return;
    }
    fetchEndpoint(Endpoints.AUTH_CHECK, {
      noRedirectAuth: true,
    }).then((r) => {
      if (r !== null) {
        setAuthed(true);
      }
    });
  }, []);

  return authed;
}

export default useCheckAuth;
