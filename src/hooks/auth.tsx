"use client";

import Endpoints from "@/types/api/endpoints";
import { StatusCodes } from "http-status-codes";
import { FC, PropsWithChildren } from "react";
import { useEffectOnce } from "react-use";

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  useEffectOnce(() => {
    fetch(Endpoints.AUTH_CHECK, { redirect: "error" })
      .then((r) => {
        if (
          r.status === StatusCodes.FORBIDDEN ||
          r.status === StatusCodes.UNAUTHORIZED
        ) {
          redirect();
        }
      })
      .catch(redirect);
  });

  return children;
};

function redirect() {
  if (window.location.pathname != "/login") {
    window.location.href = Endpoints.AUTH_REDIRECT;
  }
}
