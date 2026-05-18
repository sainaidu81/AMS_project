import { useCallback, useEffect, useMemo, useState } from "react";

import AdminDataContext from "./AdminDataStore";
import { getEmployees, getUsers } from "../services/api";

/**
 * Provides cached admin data shared by dashboard, employees, and users pages.
 *
 * @param {{children: React.ReactNode}} props provider props
 * @returns {JSX.Element} the admin data provider
 */
export function AdminDataProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState("");
  const [usersError, setUsersError] = useState("");

  const refreshEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    setEmployeesError("");

    try {
      const data = await getEmployees();
      setEmployees(data.employees || []);
    } catch (err) {
      setEmployeesError(err.message || "Could not load employees.");
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");

    try {
      const data = await getUsers();
      setUsers(data.users || []);
    } catch (err) {
      setUsersError(err.message || "Could not load users.");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const refreshAdminData = useCallback(async () => {
    await Promise.all([refreshEmployees(), refreshUsers()]);
  }, [refreshEmployees, refreshUsers]);

  useEffect(() => {
    let shouldUpdate = true;

    Promise.all([getEmployees(), getUsers()])
      .then(([employeeData, userData]) => {
        if (shouldUpdate) {
          setEmployees(employeeData.employees || []);
          setUsers(userData.users || []);
        }
      })
      .catch((err) => {
        if (shouldUpdate) {
          const message = err.message || "Could not load admin data.";
          setEmployeesError(message);
          setUsersError(message);
        }
      })
      .finally(() => {
        if (shouldUpdate) {
          setEmployeesLoading(false);
          setUsersLoading(false);
        }
      });

    return () => {
      shouldUpdate = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      employees,
      users,
      employeesLoading,
      usersLoading,
      employeesError,
      usersError,
      refreshEmployees,
      refreshUsers,
      refreshAdminData
    }),
    [
      employees,
      users,
      employeesLoading,
      usersLoading,
      employeesError,
      usersError,
      refreshEmployees,
      refreshUsers,
      refreshAdminData
    ]
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}
