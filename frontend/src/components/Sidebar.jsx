import { NavLink, useNavigate } from "react-router-dom";

import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DesktopWindowsRoundedIcon from "@mui/icons-material/DesktopWindowsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

/**
 * Left navigation for the admin dashboard area.
 *
 * @param {{isOpen?: boolean}} props sidebar open state
 * @returns {JSX.Element} the dashboard sidebar
 */
export default function Sidebar({ isOpen = true }) {
  const navigate = useNavigate();

  const navClassName = ({ isActive }) => (isActive ? "nav-item active" : "nav-item");

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");

    if (confirmLogout) {
      sessionStorage.removeItem("amsUser");
      sessionStorage.removeItem("amsToken");
      navigate("/", { replace: true });
    }
  };

  return (
    <aside className={`sidebar-container ${isOpen ? "" : "sidebar-closed"}`}>
      <div className="sidebar-logo-header">
        <div className="hexagon-logo" aria-hidden="true" />
        <span className="brand-text">AMS</span>
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

        <button className="sidebar-logout-action" type="button" onClick={handleLogout}>
          <LogoutRoundedIcon className="menu-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
