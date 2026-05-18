import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const readStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("amsUser"));
  } catch {
    return null;
  }
};

/**
 * Lightweight dashboard placeholder for roles whose full modules are not built yet.
 *
 * @param {{title: string}} props dashboard title
 * @returns {JSX.Element} the role dashboard page
 */
export default function RoleDashboard({ title }) {
  const navigate = useNavigate();
  const user = useMemo(() => readStoredUser(), []);

  const handleLogout = () => {
    sessionStorage.removeItem("amsUser");
    navigate("/", { replace: true });
  };

  return (
    <main className="dashboard-container">
      <div className="page-heading">
        <div>
          <p className="dashboard-kicker">{title}</p>
          <h1>Welcome{user?.full_name ? `, ${user.full_name}` : ""}</h1>
        </div>

        <button className="secondary-action" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-cards">
        <article className="dashboard-card">
          <span>Dashboard</span>
          <strong className="dashboard-card-text">Connected</strong>
        </article>

        <article className="dashboard-card">
          <span>Role</span>
          <strong className="dashboard-card-text">{user?.role || "User"}</strong>
        </article>
      </div>
    </main>
  );
}
