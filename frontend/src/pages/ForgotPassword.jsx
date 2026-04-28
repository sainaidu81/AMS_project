import PasswordRoundedIcon from "@mui/icons-material/PasswordRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    window.alert(`Password reset link sent to ${email} after email verification.`);
  };

  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-badge">FP</div>
            <div>
              <h1 className="auth-title">Forgot Password</h1>
              <p className="auth-copy">Reset access through email verification.</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="reset-email">Registered Email</label>
              <input
                id="reset-email"
                className="text-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your registered email"
                required
              />
              <p className="field-help">A verification link will be sent before the reset can be completed.</p>
            </div>

            <button type="submit" className="button-primary">Send Reset Link</button>

            <div className="auth-footer-note">
              <span>Remembered your password?</span>
              <Link to="/login">Back to login</Link>
            </div>
          </form>
        </div>
      </section>

      <aside className="auth-hero">
        <div className="auth-hero-content">
          <span className="auth-hero-kicker">Recovery Flow</span>
          <h2>Password reset stays tied to email verification.</h2>
          <div className="auth-points">
            <div className="auth-point">
              <PasswordRoundedIcon />
              <div>
                <strong>Secure recovery</strong>
                <div>Users can request password reset without exposing the account.</div>
              </div>
            </div>
            <div className="auth-point">
              <MarkEmailReadRoundedIcon />
              <div>
                <strong>Email-first validation</strong>
                <div>Verification confirms the request belongs to the right employee.</div>
              </div>
            </div>
            <div className="auth-point">
              <ManageAccountsRoundedIcon />
              <div>
                <strong>User management aligned</strong>
                <div>The recovery flow fits the same approval-based account controls.</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default ForgotPassword;
