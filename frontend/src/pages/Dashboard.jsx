import { useMemo } from "react";

const readStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("amsUser"));
  } catch {
    return null;
  }
};

/**
 * Admin dashboard shown after a successful admin login.
 *
 * @returns {JSX.Element} the admin dashboard page
 */
export default function Dashboard() {
  const user = useMemo(() => readStoredUser(), []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-heading">
        <p className="dashboard-kicker">Admin Dashboard</p>
        <h1>Welcome{user?.full_name ? `, ${user.full_name}` : ""}</h1>
      </div>

      <div className="dashboard-cards">
        <article className="dashboard-card">
          <span>Employees</span>
          <strong>0</strong>
        </article>

        <article className="dashboard-card">
          <span>Users</span>
          <strong>0</strong>
        </article>
      </div>
    </div>
  );
}
