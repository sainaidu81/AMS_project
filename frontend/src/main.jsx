// Import the React library, which is required for JSX and React.StrictMode.
import React from "react";

// Import ReactDOM's client renderer for mounting React into the HTML page.
import ReactDOM from "react-dom/client";

// Import the top-level App component.
import App from "./App";

// Import shared styles so the login page and future app pages can use styles.css.
import "./styles.css";

// Find the <div id="root"></div> element in index.html and create a React root inside it.
ReactDOM.createRoot(document.getElementById("root")).render(
  // StrictMode helps identify potential React problems during development.
  <React.StrictMode>
    {/* Render the full application inside the root element. */}
    <App />
  </React.StrictMode>
);
