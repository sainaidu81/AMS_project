import { useCallback, useEffect, useMemo, useState } from "react";

import AdminDataContext from "./AdminDataStore";
import {
  getAssetAssignments,
  getAssets,
  getEmployees,
  getUsers
} from "../services/api";

/**
 * Provides cached admin data shared by dashboard, employees, users, and assets pages.
 *
 * @param {{children: React.ReactNode}} props provider props
 * @returns {JSX.Element} the admin data provider
 */
export function AdminDataProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [assetAssignments, setAssetAssignments] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetAssignmentsLoading, setAssetAssignmentsLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState("");
  const [usersError, setUsersError] = useState("");
  const [assetsError, setAssetsError] = useState("");
  const [assetAssignmentsError, setAssetAssignmentsError] = useState("");

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

  const refreshAssets = useCallback(async () => {
    setAssetsLoading(true);
    setAssetsError("");

    try {
      const data = await getAssets();
      setAssets(data.assets || []);
    } catch (err) {
      setAssetsError(err.message || "Could not load assets.");
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  const refreshAssetAssignments = useCallback(async () => {
    setAssetAssignmentsLoading(true);
    setAssetAssignmentsError("");

    try {
      const data = await getAssetAssignments();
      setAssetAssignments(data.asset_assignments || []);
    } catch (err) {
      setAssetAssignmentsError(err.message || "Could not load asset assignments.");
    } finally {
      setAssetAssignmentsLoading(false);
    }
  }, []);

  const refreshAdminData = useCallback(async () => {
    await Promise.all([
      refreshEmployees(),
      refreshUsers(),
      refreshAssets(),
      refreshAssetAssignments()
    ]);
  }, [refreshEmployees, refreshUsers, refreshAssets, refreshAssetAssignments]);

  useEffect(() => {
    let shouldUpdate = true;

    Promise.all([getEmployees(), getUsers(), getAssets(), getAssetAssignments()])
      .then(([employeeData, userData, assetData, assignmentData]) => {
        if (shouldUpdate) {
          setEmployees(employeeData.employees || []);
          setUsers(userData.users || []);
          setAssets(assetData.assets || []);
          setAssetAssignments(assignmentData.asset_assignments || []);
        }
      })
      .catch((err) => {
        if (shouldUpdate) {
          const message = err.message || "Could not load admin data.";
          setEmployeesError(message);
          setUsersError(message);
          setAssetsError(message);
          setAssetAssignmentsError(message);
        }
      })
      .finally(() => {
        if (shouldUpdate) {
          setEmployeesLoading(false);
          setUsersLoading(false);
          setAssetsLoading(false);
          setAssetAssignmentsLoading(false);
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
      assets,
      assetAssignments,
      employeesLoading,
      usersLoading,
      assetsLoading,
      assetAssignmentsLoading,
      employeesError,
      usersError,
      assetsError,
      assetAssignmentsError,
      refreshEmployees,
      refreshUsers,
      refreshAssets,
      refreshAssetAssignments,
      refreshAdminData
    }),
    [
      employees,
      users,
      assets,
      assetAssignments,
      employeesLoading,
      usersLoading,
      assetsLoading,
      assetAssignmentsLoading,
      employeesError,
      usersError,
      assetsError,
      assetAssignmentsError,
      refreshEmployees,
      refreshUsers,
      refreshAssets,
      refreshAssetAssignments,
      refreshAdminData
    ]
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}
