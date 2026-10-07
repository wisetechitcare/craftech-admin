import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  authApi,
  setTenantContext,
  setWebsiteContext,
  type MeResponse,
  type UserIdentity,
} from "@/services/api";

interface AuthContextValue {
  user: UserIdentity | null;
  access: MeResponse["access"] | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserIdentity>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [access, setAccess] = useState<MeResponse["access"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const applyMe = (res: MeResponse) => {
    setUser(res.user);
    setAccess(res.access);
    if (res.access.scope === "tenant" && res.access.tenantId) {
      setTenantContext(res.access.tenantId);
    } else if (res.access.scope !== "platform") {
      setTenantContext(null);
      setWebsiteContext(null);
    }
  };

  const refreshMe = async () => {
    const res = await authApi.getMe();
    applyMe(res.data);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshMe();
      } catch {
        setUser(null);
        setAccess(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    applyMe(res.data);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setAccess(null);
      setTenantContext(null);
      setWebsiteContext(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, access, loading, login, logout, refreshMe }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
