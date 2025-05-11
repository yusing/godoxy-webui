"use client";

import Endpoints from "@/types/api/endpoints";
import { useEffect } from "react";

// weird redirect behavior with fetch
// with 'manual' redirect, the status code will be 0 and headers will be empty
// We need to use 'follow' redirect to get the correct status code and redirect URL
// https://github.com/whatwg/fetch/issues/763
export function AuthProvider() {
  useEffect(() => {
    fetch(Endpoints.AUTH_CHECK, {
      method: "HEAD",
      redirect: "follow",
    }).then(async (r) => {
      if (r.redirected) {
        window.location.href = r.url;
      }
    });
  });
  return null;
}
