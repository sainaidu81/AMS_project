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
    assets,
    assetAssignments, // Added asset assignments array from context
    employeesLoading,
    usersLoading,
    assetsLoading,
    assetAssignmentsLoading, // Added asset assignments loading state
    employeesError,
    usersError,
    assetsError,
    assetAssignmentsError // Added asset assignments error state
  } = useAdminData();

  const activeEmployeeCount = useMemo(
    () => employees.filter((employee) => employee.is_active).length,
    [employees]
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-heading">
      </div>

      {(employeesError || usersError || assetsError || assetAssignmentsError) && (
        <p className="form-error">
          {employeesError || usersError || assetsError || assetAssignmentsError}
        </p>
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

        <article className="dashboard-card">
          <span>Assets</span>
          <strong className={assetsLoading ? "loading-count" : ""}>
            {assetsLoading ? "Loading..." : (assets?.length || 0)}
          </strong>
        </article>

        {/* New Asset Assignments Card */}
        <article className="dashboard-card">
          <span>Asset Assignments</span>
          <strong className={assetAssignmentsLoading ? "loading-count" : ""}>
            {assetAssignmentsLoading ? "Loading..." : (assetAssignments?.length || 0)}
          </strong>
        </article>
      </div>
    </div>
  );
}