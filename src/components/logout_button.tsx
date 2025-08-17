"use client";

import { api } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <FaSignOutAlt
      size="22"
      aria-label="Logout"
      onClick={() => api.auth.logout().then(() => router.replace("/login"))}
    />
  );
}
