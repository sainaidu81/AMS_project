const BASE_URL = "http://localhost:8081";

/**
 * Parses a backend response and throws a message-bearing error for failed requests.
 *
 * @param {Response} response the fetch response returned by the backend
 * @returns {Promise<object>} the parsed JSON payload
 * @throws {Error} when the backend responds with a non-2xx status
 */
const parseResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

/**
 * Sends login credentials to the backend authentication endpoint.
 *
 * @param {{email: string, password: string}} userData the credentials entered by the user
 * @returns {Promise<object>} the backend login response
 */
export const loginUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  return parseResponse(response);
};
