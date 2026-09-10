import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const main = useRef<HTMLElement>(null);

  // Every admin screen scrolls inside this one element, so registering it here
  // gives auto-scroll to every drag list in the app at once.
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
          className="flex-1 overflow-y-auto bg-canvas px-4 sm:px-6 py-5 sm:py-6"
        >
          <div className="max-w-(--breakpoint-2xl) mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
