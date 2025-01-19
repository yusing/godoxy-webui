"use client";

import Endpoints from "@/types/api/endpoints";
import { Link, Show } from "@chakra-ui/react";
import { FaSignOutAlt } from "react-icons/fa";
import { useCheckAuth } from "./auth";

export default function LogoutButton() {
  const authed = useCheckAuth();
  return (
    <Show when={authed}>
      <Link aria-label="Logout" href={Endpoints.AUTH_LOGOUT}>
        <FaSignOutAlt size="22" />
      </Link>
    </Show>
  );
}
