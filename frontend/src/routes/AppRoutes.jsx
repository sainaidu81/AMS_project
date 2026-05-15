import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";

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
      </Routes>
    </BrowserRouter>
  );
}
