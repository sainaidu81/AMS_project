import { assets } from "../data/mockData";

function StockDashboard() {
  const totalAssets = assets.length;
  const availableAssets = assets.filter((asset) => asset.status === "Available").length;
  const assignedAssets = assets.filter((asset) => asset.status === "Assigned").length;
  const maintenanceAssets = assets.filter((asset) => asset.status === "Maintenance").length;

  const typeBreakdown = Object.entries(
    assets.reduce((accumulator, asset) => {
      accumulator[asset.assetType] = (accumulator[asset.assetType] || 0) + 1;
      return accumulator;
    }, {}),
  );

  return (
    <section className="page-stack">
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Total Assets</h3>
          <p className="metric-value">{totalAssets}</p>
          <p className="metric-footnote">All registered organization assets.</p>
        </article>
        <article className="metric-card">
          <h3>Available Assets</h3>
          <p className="metric-value">{availableAssets}</p>
          <p className="metric-footnote">Ready for onboarding and immediate issue.</p>
        </article>
        <article className="metric-card">
          <h3>Assigned Assets</h3>
          <p className="metric-value">{assignedAssets}</p>
          <p className="metric-footnote">Currently mapped to employees.</p>
        </article>
        <article className="metric-card">
          <h3>Maintenance Queue</h3>
          <p className="metric-value">{maintenanceAssets}</p>
          <p className="metric-footnote">Needs repair, audit, or hardware attention.</p>
        </article>
      </div>

      <div className="surface-card">
        <h3>Assets by Type</h3>
        <div className="progress-list">
          {typeBreakdown.map(([type, count]) => (
            <div className="progress-item" key={type}>
              <div className="progress-top">
                <span>{type}</span>
                <span>{count}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(count / totalAssets) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StockDashboard;
