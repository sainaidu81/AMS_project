import { useMemo } from "react";

import useAdminData from "../context/useAdminData";

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
  const {
    employees,
    users,
    employeesLoading,
    usersLoading,
    employeesError,
    usersError
  } = useAdminData();

  const activeEmployeeCount = useMemo(
    () => employees.filter((employee) => employee.is_active).length,
    [employees]
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-heading">
        <p className="dashboard-kicker">Admin Dashboard</p>
        <h1>Welcome{user?.full_name ? `, ${user.full_name}` : ""}</h1>
      </div>

      {(employeesError || usersError) && (
        <p className="form-error">{employeesError || usersError}</p>
      )}

      <div className="dashboard-cards">
        <article className="dashboard-card">
          <span>Active Employees</span>
          <strong className={employeesLoading ? "loading-count" : ""}>
            {employeesLoading ? "Loading..." : activeEmployeeCount}
          </strong>
        </article>

        <article className="dashboard-card">
          <span>Users</span>
          <strong className={usersLoading ? "loading-count" : ""}>
            {usersLoading ? "Loading..." : users.length}
          </strong>
        </article>
      </div>
    </div>
  );
}
