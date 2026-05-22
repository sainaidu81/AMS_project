import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/**
 * Shared authenticated layout used by role-specific dashboard areas.
 *
 * @returns {JSX.Element} the sidebar shell and active route outlet
 */
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} />

      <main className="app-main">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <section className="app-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
