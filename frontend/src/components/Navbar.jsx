import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const routeTitles = {
  "/dashboard": "Dashboard & Reports",
  "/assets/register": "Asset Registration",
  "/assets": "Stock List",
  "/employees": "Employee Directory",
  "/onboarding": "Asset Onboarding",
  "/offboarding": "Asset Offboarding",
  "/reports": "Operational Reports",
};

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);

  const title = routeTitles[location.pathname] ||
    (location.pathname.startsWith("/assets/") ? "Asset Details" :
      location.pathname.startsWith("/employees/") ? "Employee Details" : "Asset Management");

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <header className="navbar-shell">
      <div>
        <p className="breadcrumb">Operations / IT Asset Control</p>
        <h2>{title}</h2>
      </div>

      <div className="navbar-actions">
        <div className="stat-pill">Approved Users Only</div>
        <div className="user-chip">{storedUser?.name || "IT Manager"}</div>
        <button type="button" className="button-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
