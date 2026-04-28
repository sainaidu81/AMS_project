import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import StockDashboard from "../components/StockDashboard";
import OnboardingDashboard from "../components/OnboardingDashboard";
import { assets, employees } from "../data/mockData";

function Dashboard() {
  const totalAssigned = assets.filter((asset) => asset.status === "Assigned").length;
  const totalAvailable = assets.filter((asset) => asset.status === "Available").length;

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Dashboard & Reports Module</span>
          <h1>Stock and onboarding dashboards in one command view.</h1>
          <p>
            Monitor total assets, availability, assignment load, employee distribution,
            and recent onboarding activity from the same workspace.
          </p>
        </div>

        <aside className="hero-stat-grid">
          <article className="stat-card">
            <Inventory2RoundedIcon />
            <p className="metric-value">{assets.length}</p>
            <p className="metric-footnote">Total assets</p>
          </article>
          <article className="stat-card">
            <AssignmentIndRoundedIcon />
            <p className="metric-value">{totalAssigned}</p>
            <p className="metric-footnote">Assigned assets</p>
          </article>
          <article className="stat-card">
            <QueryStatsRoundedIcon />
            <p className="metric-value">{totalAvailable}</p>
            <p className="metric-footnote">Available assets</p>
          </article>
          <article className="stat-card">
            <AssignmentIndRoundedIcon />
            <p className="metric-value">{employees.length}</p>
            <p className="metric-footnote">Tracked employees</p>
          </article>
        </aside>
      </section>

      <StockDashboard />
      <OnboardingDashboard />
    </div>
  );
}

export default Dashboard;