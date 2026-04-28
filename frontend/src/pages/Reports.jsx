import { assets, employees, onboardingActivity, reportCatalog } from "../data/mockData";

function Reports() {
  const assignedAssets = assets.filter((asset) => asset.status === "Assigned").length;
  const departmentBreakdown = Object.entries(
    employees.reduce((accumulator, employee) => {
      accumulator[employee.department] = (accumulator[employee.department] || 0) + employee.assets.length;
      return accumulator;
    }, {}),
  );

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Dashboard & Reports Module</span>
          <h1>Operational reports for stock visibility and onboarding activity.</h1>
          <p>
            Use this reporting area for stock dashboard summaries, department allocation,
            employee assignment visibility, and recent onboarding activity snapshots.
          </p>
        </div>
      </section>

      <div className="metric-grid">
        <article className="metric-card">
          <h3>Total Assets</h3>
          <p className="metric-value">{assets.length}</p>
          <p className="metric-footnote">Inventory currently registered in the organization.</p>
        </article>
        <article className="metric-card">
          <h3>Available Assets</h3>
          <p className="metric-value">{assets.filter((asset) => asset.status === "Available").length}</p>
          <p className="metric-footnote">Ready for allocation.</p>
        </article>
        <article className="metric-card">
          <h3>Assigned Assets</h3>
          <p className="metric-value">{assignedAssets}</p>
          <p className="metric-footnote">Currently issued to employees.</p>
        </article>
        <article className="metric-card">
          <h3>Recent Onboarding</h3>
          <p className="metric-value">{onboardingActivity.length}</p>
          <p className="metric-footnote">Recent activities in the onboarding dashboard.</p>
        </article>
      </div>

      <div className="report-grid">
        <section className="table-card">
          <h3>Available Reports</h3>
          <div className="timeline-list">
            {reportCatalog.map((report) => (
              <div className="timeline-item" key={report}>
                <div className="timeline-top">
                  <strong>{report}</strong>
                  <span className="status-badge status-assigned">Ready</span>
                </div>
                <span className="meta-copy">Export options can be connected to PDF or Excel actions.</span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card">
          <h3>Onboarding Dashboard Highlights</h3>
          <div className="progress-list">
            {departmentBreakdown.map(([department, count]) => (
              <div className="progress-item" key={department}>
                <div className="progress-top">
                  <span>{department}</span>
                  <span>{count} assets</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.max(count * 34, 16)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="timeline-list" style={{ marginTop: "18px" }}>
            {onboardingActivity.map((activity) => (
              <div className="timeline-item" key={`${activity.date}-${activity.employee}`}>
                <div className="timeline-top">
                  <strong>{activity.employee}</strong>
                  <span className="meta-copy">{activity.date}</span>
                </div>
                <span>{activity.department}</span>
                <span className="meta-copy">{activity.asset}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Reports;
