import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const updateField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSignup = (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      window.alert("Password and confirm password must match.");
      return;
    }

    const user = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: "User",
      approved: false,
      emailVerified: false,
    };

    localStorage.setItem("user", JSON.stringify(user));
    window.alert("Registration saved. Account is pending admin approval and email verification.");
    navigate("/login");
  };

  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-badge">SU</div>
            <div>
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-copy">Register with approval-based access for the asset portal.</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSignup}>
            <div className="field-group">
              <label className="field-label" htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                className="text-input"
                value={form.name}
                onChange={updateField("name")}
                placeholder="Enter employee full name"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                className="text-input"
                type="email"
                value={form.email}
                onChange={updateField("email")}
                placeholder="Enter official email"
                required
              />
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  className="text-input"
                  type="password"
                  value={form.password}
                  onChange={updateField("password")}
                  placeholder="Create password"
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="signup-confirm">Confirm Password</label>
                <input
                  id="signup-confirm"
                  className="text-input"
                  type="password"
                  value={form.confirmPassword}
                  onChange={updateField("confirmPassword")}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="button-primary">Submit Registration</button>

            <div className="auth-footer-note">
              <span>Existing account holder?</span>
              <Link to="/login">Back to login</Link>
            </div>
          </form>
        </div>
      </section>

      <aside className="auth-hero">
        <div className="auth-hero-content">
          <span className="auth-hero-kicker">User Management Module</span>
          <h2>Register only the right people for the right operations.</h2>
          <div className="auth-points">
            <div className="auth-point">
              <PersonAddAltRoundedIcon />
              <div>
                <strong>New account registration</strong>
                <div>Name, email, and password are collected during sign up.</div>
              </div>
            </div>
            <div className="auth-point">
              <MailOutlineRoundedIcon />
              <div>
                <strong>Email verification ready</strong>
                <div>Accounts can be flagged for activation after email validation.</div>
              </div>
            </div>
            <div className="auth-point">
              <HowToRegRoundedIcon />
              <div>
                <strong>Approval workflow</strong>
                <div>Only approved users should move from registration into active access.</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Signup;
