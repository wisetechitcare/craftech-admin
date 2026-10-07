import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/context/AuthContext";
import {
  WORKSPACE_TENANT_STORAGE_KEY,
  WORKSPACE_WEBSITE_STORAGE_KEY,
} from "@/lib/constants/workspace";
import {
  setTenantContext,
  setWebsiteContext,
  tenantsApi,
  workspaceApi,
  type WorkspacePayload,
  type WorkspaceTenantOption,
  type WorkspaceWebsite,
} from "@/services/api";

interface WorkspaceContextValue {
  loading: boolean;
  tenantId: string | null;
  tenantName: string | null;
  websiteId: string | null;
  websiteName: string | null;
  tenants: WorkspaceTenantOption[];
  websites: WorkspaceWebsite[];
  setTenantId: (id: string) => void;
  setWebsiteId: (id: string) => void;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function pickWebsite(
  websites: WorkspaceWebsite[],
  preferredId: string | null,
): WorkspaceWebsite | null {
  if (!websites.length) return null;
  if (preferredId) {
    const match = websites.find((w) => w.id === preferredId);
    if (match) return match;
  }
  return websites[0];
}

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user, access, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [websiteId, setWebsiteIdState] = useState<string | null>(null);
  const [websiteName, setWebsiteName] = useState<string | null>(null);
  const [tenants, setTenants] = useState<WorkspaceTenantOption[]>([]);
  const [websites, setWebsites] = useState<WorkspaceWebsite[]>([]);

  const applyWorkspace = useCallback((data: WorkspacePayload) => {
    setTenantName(data.tenant.name);
    setWebsites(data.websites);
    setTenantIdState(data.tenant.id);
    setTenantContext(data.tenant.id);

    const storedWebsite = localStorage.getItem(WORKSPACE_WEBSITE_STORAGE_KEY);
    const website = pickWebsite(
      data.websites,
      storedWebsite ?? data.currentWebsiteId,
    );
    if (website) {
      setWebsiteIdState(website.id);
      setWebsiteName(website.name);
      setWebsiteContext(website.id);
      localStorage.setItem(WORKSPACE_WEBSITE_STORAGE_KEY, website.id);
    } else {
      setWebsiteIdState(null);
      setWebsiteName(null);
      setWebsiteContext(null);
    }
    localStorage.setItem(WORKSPACE_TENANT_STORAGE_KEY, data.tenant.id);
  }, []);

  const refreshWorkspace = useCallback(async () => {
    const res = await workspaceApi.get();
    applyWorkspace(res.data.data);
  }, [applyWorkspace]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !access) {
      setLoading(false);
      setTenantIdState(null);
      setWebsiteIdState(null);
      setTenants([]);
      setWebsites([]);
      return;
    }

    const bootstrap = async () => {
      setLoading(true);
      try {
        if (access.scope === "platform") {
          const listRes = await tenantsApi.list();
          const list = listRes.data.data.map((t) => ({
            id: t.id,
            name: t.name,
            status: t.status,
            websites: t.websites ?? [],
          }));
          setTenants(list);

          const storedTenant = localStorage.getItem(
            WORKSPACE_TENANT_STORAGE_KEY,
          );
          const tenant =
            list.find((t) => t.id === storedTenant) ?? list[0] ?? null;
          if (tenant) {
            setTenantContext(tenant.id);
            await refreshWorkspace();
          }
        } else if (access.tenantId) {
          setTenantContext(access.tenantId);
          await refreshWorkspace();
        }
      } catch {
        setTenantContext(null);
        setWebsiteContext(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [authLoading, user, access, refreshWorkspace]);

  const setTenantId = useCallback(
    async (id: string) => {
      localStorage.setItem(WORKSPACE_TENANT_STORAGE_KEY, id);
      setTenantContext(id);
      setWebsiteContext(null);
      await refreshWorkspace();
    },
    [refreshWorkspace],
  );

  const setWebsiteId = useCallback(
    (id: string) => {
      const website = websites.find((w) => w.id === id);
      if (!website) return;
      setWebsiteIdState(id);
      setWebsiteName(website.name);
      setWebsiteContext(id);
      localStorage.setItem(WORKSPACE_WEBSITE_STORAGE_KEY, id);
    },
    [websites],
  );

  const value = useMemo(
    () => ({
      loading,
      tenantId,
      tenantName,
      websiteId,
      websiteName,
      tenants,
      websites,
      setTenantId,
      setWebsiteId,
      refreshWorkspace,
    }),
    [
      loading,
      tenantId,
      tenantName,
      websiteId,
      websiteName,
      tenants,
      websites,
      setTenantId,
      setWebsiteId,
      refreshWorkspace,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
};
