import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";

import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";

import Sidebar from "./Sidebar";
import Header from "./Header";

function LayoutBody() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const main = useRef<HTMLElement>(null);
  const { tenantId, websiteId } = useWorkspace();
  const scopeKey = `${tenantId ?? ""}:${websiteId ?? ""}`;

  useEffect(() => {
    const element = main.current;
    if (!element) return;
    return autoScrollForElements({ element });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main
          ref={main}
          className="relative flex-1 overflow-y-auto bg-canvas px-4 sm:px-6 py-5 sm:py-6"
        >
          <div className="max-w-(--breakpoint-2xl) mx-auto">
            <Outlet key={scopeKey} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <WorkspaceProvider>
      <LayoutBody />
    </WorkspaceProvider>
  );
}
