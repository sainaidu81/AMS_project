// Import useState so this component can store form input values while the user types.
import { useState } from "react";

// Import Material UI icons that match the new login design without adding react-icons as a new dependency.
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LaptopMacRoundedIcon from "@mui/icons-material/LaptopMacRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

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

  // Store whether the password field should show plain text or hidden dots.
  const [showPassword, setShowPassword] = useState(false);

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

  // Show the office-specific password recovery instruction instead of exposing account signup/reset logic.
  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Please contact your AMS administrator to reset your password.");
  };

  // Return the JSX that renders the login page.
  return (
    // login-page owns the full-screen background so these styles do not leak into dashboard pages later.
    <div className="login-page">
      {/* Glass-style login card based on the provided design. */}
      <div className="login-box">
        {/* Brand block shown above the form. */}
        <div className="login-logo">
          <LaptopMacRoundedIcon fontSize="inherit" />
          <h1>AMS Login</h1>
          <p>Asset Management System</p>
        </div>

        {/* Form calls handleSubmit when the user clicks Login or presses Enter. */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email field: frontend validates basic shape, backend validates again before database lookup. */}
          <div className="input-box">
            <EmailRoundedIcon className="left-icon" fontSize="small" />
            <input
              name="email"
              type="email"
              placeholder="Enter Email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          {/* Password field: value is not trimmed because spaces can be part of a real password. */}
          <div className="input-box">
            <LockRoundedIcon className="left-icon" fontSize="small" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />

            {/* Toggle only changes visibility; it never changes the password value itself. */}
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <VisibilityOffRoundedIcon fontSize="small" />
              ) : (
                <VisibilityRoundedIcon fontSize="small" />
              )}
            </button>
          </div>

          {/* Show frontend validation feedback before the backend request is sent. */}
          {error && <p className="login-error" role="alert">{error}</p>}

          {/* Password recovery guidance for office-managed accounts. */}
          <div className="login-options">
            <a href="#forgot-password" onClick={handleForgotPassword}>
              Forgot Password?
            </a>
          </div>

          {/* Submit button triggers the form's onSubmit handler. */}
          <button className="login-button" type="submit">Login</button>
        </form>

        <div className="login-footer">
          &copy; 2026 Asset Management System
        </div>
      </div>
    </div>
  );
}
