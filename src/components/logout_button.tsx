"use client";

import Endpoints from "@/types/api/endpoints";
import { Link } from "@chakra-ui/react";
import { FaSignOutAlt } from "react-icons/fa";

export default function LogoutButton() {
  return (
    <Link aria-label="Logout" href={Endpoints.AUTH_LOGOUT}>
      <FaSignOutAlt size="22" />
    </Link>
  );
}
