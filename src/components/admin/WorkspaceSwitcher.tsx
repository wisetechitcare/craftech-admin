import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function WorkspaceSwitcher() {
  const { access } = useAuth();
  const {
    loading,
    tenantId,
    tenantName,
    websiteId,
    websiteName,
    tenants,
    websites,
    setTenantId,
    setWebsiteId,
  } = useWorkspace();

  if (loading || !access) return null;

  const showTenantPicker = access.scope === "platform" && tenants.length > 1;
  const showWebsitePicker = websites.length > 1;

  if (!showTenantPicker && !showWebsitePicker) {
    if (!tenantName) return null;
    return (
      <span className="hidden md:inline text-xs text-ink-mute truncate max-w-40">
        {tenantName}
        {websiteName ? ` · ${websiteName}` : ""}
      </span>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2 min-w-0">
      {showTenantPicker ? (
        <select
          aria-label="Workspace tenant"
          className="text-xs rounded-lg border border-line-2 bg-raise px-2 py-1.5 max-w-36 truncate"
          value={tenantId ?? ""}
          onChange={(e) => setTenantId(e.target.value)}
        >
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-xs text-ink-mute truncate max-w-32">
          {tenantName}
        </span>
      )}
      {showWebsitePicker ? (
        <select
          aria-label="Website"
          className="text-xs rounded-lg border border-line-2 bg-raise px-2 py-1.5 max-w-36 truncate"
          value={websiteId ?? ""}
          onChange={(e) => setWebsiteId(e.target.value)}
        >
          {websites.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      ) : websiteName ? (
        <span className="text-xs text-ink-mute truncate max-w-32">
          {websiteName}
        </span>
      ) : null}
    </div>
  );
}
