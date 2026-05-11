// BrowserRouter enables client-side routing in the browser.
// Routes groups all route definitions.
// Route maps a URL path to the component that should render.
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import the Login page shown at the default route.
import Login from "../pages/Login";

// AppRoutes stores all frontend route definitions in one place.
export default function AppRoutes() {
  // Return the router setup used by the whole React application.
  return (
    // BrowserRouter watches the URL and renders the matching route without a full page reload.
    <BrowserRouter>
      {/* Routes contains every path/component mapping for the app. */}
      <Routes>
        {/* Default route: visiting http://localhost:5173/ shows Login. */}
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
