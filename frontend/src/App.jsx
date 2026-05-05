// Import the central routing component for the React application.
import AppRoutes from "./routes/AppRoutes";

// App is the top-level React component rendered by main.jsx.
function App() {
  // Render the route configuration so different URLs show different pages.
  return <AppRoutes />;
}

// Export App so main.jsx can import and render it into the browser.
export default App;
