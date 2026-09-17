import { Outlet } from "react-router-dom";

export default function AppearanceLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Appearance</h2>
        <p className="text-sm text-ink-mute mt-1">
          The style each section is drawn in on the live site
        </p>
      </div>

      <Outlet />
    </div>
  );
}
