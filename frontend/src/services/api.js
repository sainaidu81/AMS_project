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

/**
 * Fetches all employees from the backend.
 *
 * @returns {Promise<object>} the employees response
 */
export const getEmployees = async () => {
  const response = await fetch(`${BASE_URL}/employees`);

  return parseResponse(response);
};

/**
 * Creates an employee record through the backend.
 *
 * @param {object} employeeData the employee form data
 * @returns {Promise<object>} the created employee response
 */
export const createEmployee = async (employeeData) => {
  const response = await fetch(`${BASE_URL}/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(employeeData)
  });

  return parseResponse(response);
};

/**
 * Updates an existing employee record.
 *
 * @param {string} employeeId the employee id to update
 * @param {object} employeeData the employee form data
 * @returns {Promise<object>} the updated employee response
 */
export const updateEmployee = async (employeeId, employeeData) => {
  const response = await fetch(`${BASE_URL}/employees/${encodeURIComponent(employeeId)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(employeeData)
  });

  return parseResponse(response);
};

/**
 * Deactivates an employee and removes their matching user credentials.
 *
 * @param {string} employeeId the employee id to deactivate
 * @returns {Promise<object>} the delete response
 */
export const deleteEmployee = async (employeeId) => {
  const response = await fetch(`${BASE_URL}/employees/${encodeURIComponent(employeeId)}`, {
    method: "DELETE"
  });

  return parseResponse(response);
};

/**
 * Fetches all users from the backend without password hashes.
 *
 * @returns {Promise<object>} the users response
 */
export const getUsers = async () => {
  const response = await fetch(`${BASE_URL}/users`);

  return parseResponse(response);
};

/**
 * Creates a user credential row. The backend hashes the password.
 *
 * @param {object} userData the new user data
 * @returns {Promise<object>} the created user response
 */
export const createUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  return parseResponse(response);
};

/**
 * Updates a user record.
 *
 * @param {string} employeeId the employee id for the user row
 * @param {object} userData the updated user data
 * @returns {Promise<object>} the updated user response
 */
export const updateUser = async (employeeId, userData) => {
  const response = await fetch(`${BASE_URL}/users/${encodeURIComponent(employeeId)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  return parseResponse(response);
};

/**
 * Deletes a user credential row.
 *
 * @param {string} employeeId the employee id for the user row
 * @returns {Promise<object>} the delete response
 */
export const deleteUser = async (employeeId) => {
  const response = await fetch(`${BASE_URL}/users/${encodeURIComponent(employeeId)}`, {
    method: "DELETE"
  });

  return parseResponse(response);
};

/**
 * Fetches all assets from the backend.
 *
 * @returns {Promise<object>} the assets response
 */
export const getAssets = async () => {
  const response = await fetch(`${BASE_URL}/assets`);

  return parseResponse(response);
};

/**
 * Creates an asset record through the backend.
 *
 * @param {object} assetData the asset form data
 * @returns {Promise<object>} the created asset response
 */
export const createAsset = async (assetData) => {
  const response = await fetch(`${BASE_URL}/assets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(assetData)
  });

  return parseResponse(response);
};

/**
 * Updates an existing asset record.
 *
 * @param {string} serviceTag the service tag to update
 * @param {object} assetData the asset form data
 * @returns {Promise<object>} the updated asset response
 */
export const updateAsset = async (serviceTag, assetData) => {
  const response = await fetch(`${BASE_URL}/assets/${encodeURIComponent(serviceTag)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(assetData)
  });

  return parseResponse(response);
};

/**
 * Deletes an asset record.
 *
 * @param {string} serviceTag the service tag to delete
 * @returns {Promise<object>} the delete response
 */
export const deleteAsset = async (serviceTag) => {
  const response = await fetch(`${BASE_URL}/assets/${encodeURIComponent(serviceTag)}`, {
    method: "DELETE"
  });

  return parseResponse(response);
};
