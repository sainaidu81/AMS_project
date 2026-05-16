import { NavLink, useNavigate } from "react-router-dom";

/**
 * Left navigation for the admin dashboard area.
 *
 * @returns {JSX.Element} the dashboard sidebar
 */
export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");

    if (confirmLogout) {
      sessionStorage.removeItem("amsUser");
      navigate("/", { replace: true });
    }
  };

  return (
    <aside className="sidebar">
      <NavLink to="/admin/dashboard">Dashboard</NavLink>
      <NavLink to="/admin/employees">Employees</NavLink>
      <NavLink to="/admin/users">Users</NavLink>

      <button className="logout-btn" type="button" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}
