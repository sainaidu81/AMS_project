// Import useState so this component can store form input values while the user types.
import { useState } from "react";

// Import the API helper that sends login data to the Java backend.
import { loginUser } from "../services/api";

// Keep the frontend email check practical instead of trying to support every rare RFC email edge case.
// This is only a user-experience check; the backend repeats validation and remains the real authority.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password creation/reset rules can be stricter, but login should only reject obvious invalid input.
// A max length guard prevents accidental huge requests without blocking normal passwords.
const MAX_PASSWORD_LENGTH = 128;

// Login is the page component shown at the default route "/".
export default function Login() {

  // Store the login form values in React state.
  const [form, setForm] = useState({
    // Email starts empty until the user types into the email input.
    email: "",

    // Password starts empty until the user types into the password input.
    password: ""
  });

  // Store a validation message that is shown before the API call when the form has obvious mistakes.
  const [error, setError] = useState("");

  // Validate only the login form basics on the frontend.
  // Frontend validation improves the user's experience, but it can be bypassed, so the backend repeats it.
  const validateForm = () => {
    // Email is trimmed because leading/trailing spaces are almost always accidental for email addresses.
    const email = form.email.trim();

    // Password is intentionally not trimmed because spaces can be valid characters in a password.
    const password = form.password;

    if (!email) {
      return "Email is required.";
    }

    if (!EMAIL_PATTERN.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!password) {
      return "Password is required.";
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      return `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`;
    }

    return "";
  };

  // Update the correct field in state whenever the user types in an input.
  const handleChange = (e) => {
    // Clear the old validation message once the user starts correcting the form.
    setError("");

    // Copy the current form values and replace only the field that changed.
    setForm({
      // Keep the existing values that did not change.
      ...form,

      // Use the input's name attribute to decide whether to update email or password.
      [e.target.name]: e.target.value
    });
  };

  // Handle the form submit event when the Login button is clicked.
  const handleSubmit = async (e) => {
    // Prevent the browser from refreshing the page after form submission.
    e.preventDefault();

    // Run quick frontend validation before making the backend request.
    const validationError = validateForm();

    // Stop here when the form has an obvious issue, such as a missing password or invalid email shape.
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Send the current email and password to the backend /login endpoint.
      // Email is sent trimmed so accidental spaces do not cause a failed lookup.
      // Password is sent exactly as typed because spaces may be part of the real password.
      const data = await loginUser({
        email: form.email.trim(),
        password: form.password
      });

      // Show the backend's response message to the user.
      alert(data.message);

    } catch (err) {
      // Show the backend error message when login fails.
      alert(err.message || "Error connecting to backend");
    }
  };

  // Return the JSX that renders the login page.
  return (
    // Outer wrapper for the login page content.
    <div>
      {/* Page heading shown above the login form. */}
      <h2>Login Page</h2>

      {/* Form calls handleSubmit when the user clicks Login or presses Enter. */}
      <form onSubmit={handleSubmit}>
        {/* Email input uses name="email" so handleChange updates form.email. */}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        /><br /><br />

        {/* Password input uses type="password" so typed characters are hidden. */}
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        /><br /><br />

        {/* Show frontend validation feedback before the backend request is sent. */}
        {error && <p role="alert">{error}</p>}

        {/* Submit button triggers the form's onSubmit handler. */}
        <button type="submit">Login</button>
      </form>

      {/* Password recovery guidance for office-managed accounts. */}
      <p>
        Did you forget your password?{" "}
        <a
          href="#forgot-password"
          onClick={(e) => {
            e.preventDefault();
            alert("Please contact your AMS administrator to reset your password.");
          }}
        >
          Forgot password
        </a>
      </p>
    </div>
  );
}
