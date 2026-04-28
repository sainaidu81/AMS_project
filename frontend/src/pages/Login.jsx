import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userSeed } from "../data/mockData";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const candidates = [storedUser, userSeed].filter(Boolean);

    const matchedUser = candidates.find((candidate) => {
      const matchesIdentity =
        candidate.name.toLowerCase() === normalizedIdentifier ||
        candidate.email.toLowerCase() === normalizedIdentifier;

      return matchesIdentity && candidate.password === password && candidate.approved !== false;
    });

    if (matchedUser) {
      localStorage.setItem("user", JSON.stringify(matchedUser));
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
      return;
    }

    window.alert("Invalid credentials or account not approved yet.");
  };

  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-badge">AH</div>
            <div>
              <h1 className="auth-title">Asset Hub</h1>
              <p className="auth-copy">Sign in to manage stock, onboarding, and reports.</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="field-group">
              <label className="field-label" htmlFor="identifier">Name or Email</label>
              <input
                id="identifier"
                className="text-input"
                type="text"
                placeholder="Enter your name or work email"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="text-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="helper-links">
              <Link to="/forgot-password">Forgot password?</Link>
              <span className="meta-copy">Use seeded login: {userSeed.email}</span>
            </div>

            <button type="submit" className="button-primary">Login</button>

            <div className="auth-footer-note">
              <span>New user registration is approval based.</span>
              <Link to="/signup">Create account</Link>
            </div>
          </form>
        </div>
      </section>

      <aside className="auth-hero">
        <div className="auth-hero-content">
          <span className="auth-hero-kicker">Lifecycle Control</span>
          <h2>Track every asset from registration to return.</h2>
          <p>
            The portal covers secure login, controlled user access, asset registration,
            stock visibility, employee allocation, onboarding, offboarding, and reporting.
          </p>
          <div className="auth-points">
            <div className="auth-point">
              <SecurityRoundedIcon />
              <div>
                <strong>Controlled access</strong>
                <div>Only approved users can enter the system and activate accounts.</div>
              </div>
            </div>
            <div className="auth-point">
              <InventoryRoundedIcon />
              <div>
                <strong>Service tag driven records</strong>
                <div>Keep inventory searchable by asset type, status, and unique service tag.</div>
              </div>
            </div>
            <div className="auth-point">
              <VerifiedRoundedIcon />
              <div>
                <strong>Immediate visibility</strong>
                <div>Updates flow into stock views, assignments, and dashboards without friction.</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Login;
