import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import AssetDetails from "../pages/AssetDetails";
import AssetList from "../pages/AssetList";
import AssetRegistration from "../pages/AssetRegistration";
import Dashboard from "../pages/Dashboard";
import EmployeeDetails from "../pages/EmployeeDetails";
import EmployeeList from "../pages/EmployeeList";
import ForgotPassword from "../pages/ForgotPassword";
import Login from "../pages/Login";
import Offboarding from "../pages/Offboarding";
import Onboarding from "../pages/Onboarding";
import Reports from "../pages/Reports";
import Signup from "../pages/Signup";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          element={(
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          )}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assets/register" element={<AssetRegistration />} />
          <Route path="/assets" element={<AssetList />} />
          <Route path="/assets/:serviceTag" element={<AssetDetails />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/:employeeId" element={<EmployeeDetails />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/offboarding" element={<Offboarding />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
