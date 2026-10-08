import type { ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/services/api";

const SUPER_ADMIN: UserRole = "SUPER_ADMIN";

interface SuperAdminGateProps {
  children: ReactNode;
}

export default function SuperAdminGate({ children }: SuperAdminGateProps) {
  const { user } = useAuth();

  if (user?.role !== SUPER_ADMIN) {
    return <p className="text-ink-mute">Super admin access required.</p>;
  }

  return children;
}
