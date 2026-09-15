import { Outlet } from "react-router-dom";

export default function SiteIdentityLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Site Identity</h2>
        <p className="text-sm text-ink-mute mt-1">
          Global look-and-feel that applies across every page on the live site
        </p>
      </div>

      <Outlet />
    </div>
  );
}
