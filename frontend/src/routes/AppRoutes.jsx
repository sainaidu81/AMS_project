import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "../components/Layout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import Users from "../pages/Users";

const getStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("amsUser"));
  } catch {
    return null;
  }
};

const RequireRole = ({ role, children }) => {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Defines the client-side routes for the frontend application.
 *
 * @returns {JSX.Element} the router configuration for the app
 */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <Layout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="users" element={<Users />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
