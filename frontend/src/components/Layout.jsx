import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="layout-shell">
      <Sidebar />
      <div className="main-shell">
        <Navbar />
        <main className="page-shell">
          <Outlet />
        </main>
        <footer className="app-footer">
          Asset Management System for registration, stock tracking, employee allocation, onboarding, offboarding, and reports.
        </footer>
      </div>
    </div>
  );
}

export default Layout;
