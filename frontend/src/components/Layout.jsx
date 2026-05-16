import { Link, Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

/**
 * Shared authenticated layout used by role-specific dashboard areas.
 *
 * @returns {JSX.Element} the sidebar shell and active route outlet
 */
export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <header className="app-header">
          <Link to="/admin/dashboard" className="app-brand">
            AMS
          </Link>
        </header>

        <section className="app-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
