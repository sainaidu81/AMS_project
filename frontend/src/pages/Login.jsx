import { useState } from "react";
import { useNavigate } from "react-router-dom";

import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LaptopMacRoundedIcon from "@mui/icons-material/LaptopMacRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

import { loginUser } from "../services/api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PASSWORD_LENGTH = 128;

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const email = form.email.trim();
    const password = form.password;

    if (!email) return "Email is required.";
    if (!EMAIL_PATTERN.test(email)) return "Please enter a valid email address.";
    if (!password) return "Password is required.";
    if (password.length > MAX_PASSWORD_LENGTH) {
      return `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`;
    }
    return "";
  };

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Calls http://localhost:8081/login from your api.js file
      const data = await loginUser({
        email: form.email.trim(),
        password: form.password
      });

      // Adjust fallback route if your backend returns data.role instead of dashboardPath
      const dashboardRoute = data.dashboardPath || "/admin/dashboard";

      sessionStorage.setItem("amsUser", JSON.stringify(data.user));
      sessionStorage.setItem("amsToken", data.token);
      navigate(dashboardRoute, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials or backend connection failure.");
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Please contact your AMS administrator to reset your password.");
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <LaptopMacRoundedIcon fontSize="inherit" />
          <h1>AMS Login</h1>
          <p>Asset Management System</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
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

          {error && <p className="login-error" role="alert">{error}</p>}

          <div className="login-options">
            <a href="#forgot-password" onClick={handleForgotPassword}>
              Forgot Password?
            </a>
          </div>

          <button className="login-button" type="submit">Login</button>
        </form>

        <div className="login-footer">
          &copy; 2026 Asset Management System
        </div>
      </div>
    </div>
  );
}
