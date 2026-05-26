import { NavLink } from "react-router-dom";

import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DesktopWindowsRoundedIcon from "@mui/icons-material/DesktopWindowsRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

/**
 * Left navigation for the admin dashboard area.
 *
 * @param {{isOpen?: boolean}} props sidebar open state
 * @returns {JSX.Element} the dashboard sidebar
 */
export default function Sidebar({ isOpen = true }) {
  const navClassName = ({ isActive }) => (isActive ? "nav-item active" : "nav-item");

  return (
    <aside className={`sidebar-container ${isOpen ? "" : "sidebar-closed"}`}>
      <div className="sidebar-logo-header">
        <div className="hexagon-logo" aria-hidden="true" />
        <span className="brand-text">AMS_project</span>
      </div>

      <div className="sidebar-dark-body">
        <nav className="sidebar-links-menu">
          <NavLink to="/admin/dashboard" className={navClassName}>
            <DashboardRoundedIcon className="menu-icon" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/employees" className={navClassName}>
            <BadgeRoundedIcon className="menu-icon" />
            <span>Employees</span>
          </NavLink>

          <NavLink to="/admin/users" className={navClassName}>
            <PeopleAltRoundedIcon className="menu-icon" />
            <span>Users</span>
          </NavLink>

          <NavLink to="/admin/assets" className={navClassName}>
            <DesktopWindowsRoundedIcon className="menu-icon" />
            <span>Assets</span>
          </NavLink>

          <NavLink to="/admin/asset_assignments" className={navClassName}>
            <AssignmentRoundedIcon className="menu-icon" />
            <span>Asset Assignments</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}