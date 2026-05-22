import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

// Material UI Icons matching your layout perfectly
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import DesktopWindowsRoundedIcon from "@mui/icons-material/DesktopWindowsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

export default function Sidebar({ isOpen = true }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Admin User");

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("amsUser");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const nameToDisplay = parsedUser.full_name || parsedUser.name || parsedUser.username;
        if (nameToDisplay) {
          setUsername(nameToDisplay);
        }
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      sessionStorage.removeItem("amsUser");
      sessionStorage.removeItem("amsToken");
      navigate("/", { replace: true });
    }
  };

  return (
    <aside className={`sidebar-container ${!isOpen ? 'sidebar-closed' : ''}`}>
      {/* 1. White Top Header Section */}
      <div className="sidebar-logo-header">
        <div className="logo-icon">
          <div className="hexagon-logo"></div>
        </div>
        <span className="brand-text">AMS Portal</span>
      </div>

      {/* 2. Dark Blue Navigation Section */}
      <div className="sidebar-dark-body">
        {/* Your 4 original links with explicit custom text font scaling */}
        <nav className="sidebar-links-menu">
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <DashboardRoundedIcon className="menu-icon" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/employees" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <BadgeRoundedIcon className="menu-icon" />
            <span>Employees</span>
          </NavLink>

          <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <PeopleAltRoundedIcon className="menu-icon" />
            <span>Users</span>
          </NavLink>

          <NavLink to="/admin/assets" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <DesktopWindowsRoundedIcon className="menu-icon" />
            <span>Assets</span>
          </NavLink>
        </nav>

        {/* Bottom Logout Button */}
        <button className="sidebar-logout-action" type="button" onClick={handleLogout}>
          <LogoutRoundedIcon className="menu-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}