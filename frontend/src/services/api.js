// Base URL of the Java backend server.
// The backend Main.java currently starts the server on port 8081.
const BASE_URL = "http://localhost:8081";

// Convert a fetch Response into JSON and throw helpful errors for failed HTTP statuses.
const parseResponse = async (response) => {
  // Read the JSON response body returned by the backend.
  const data = await response.json();

  // response.ok is true only for HTTP status codes in the 200-299 range.
  if (!response.ok) {
    // Throw the backend's message so pages can show it in alert().
    throw new Error(data.message || "Request failed");
  }

  // Return parsed JSON to the page component when the request succeeded.
  return data;
};

// Send login data to the backend LOGIN API.
export const loginUser = async (userData) => {
  // Send a POST request to http://localhost:8081/login.
  const response = await fetch(`${BASE_URL}/login`, {
    // POST is used because login credentials are sent in the request body.
    method: "POST",

    // Tell the backend that the request body is JSON.
    headers: {
      "Content-Type": "application/json"
    },

    // Convert the JavaScript login object into a JSON string.
    body: JSON.stringify(userData)
  });

  // Parse the backend response and throw an error if login failed.
  return parseResponse(response);
};
