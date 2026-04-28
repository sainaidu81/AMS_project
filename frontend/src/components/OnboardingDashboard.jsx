import { employees, onboardingActivity } from "../data/mockData";

function OnboardingDashboard() {
  const departmentData = Object.entries(
    employees.reduce((accumulator, employee) => {
      accumulator[employee.department] = (accumulator[employee.department] || 0) + employee.assets.length;
      return accumulator;
    }, {}),
  );

  const employeeAssignments = employees
    .map((employee) => ({
      name: employee.name,
      assets: employee.assets.length,
    }))
    .sort((left, right) => right.assets - left.assets);

  return (
    <section className="page-stack">
      <div className="card-grid">
        {departmentData.map(([department, count]) => (
          <article className="stat-card" key={department}>
            <h3>{department}</h3>
            <p className="metric-value">{count}</p>
            <p className="metric-footnote">Department wise asset allocation</p>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="surface-card">
          <h3>Employee Wise Asset Assignment</h3>
          <div className="progress-list">
            {employeeAssignments.map((employee) => (
              <div className="progress-item" key={employee.name}>
                <div className="progress-top">
                  <span>{employee.name}</span>
                  <span>{employee.assets} assets</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.max(employee.assets * 40, 18)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="timeline-card">
          <h3>Recent Onboarding Activities</h3>
          <div className="timeline-list">
            {onboardingActivity.map((activity) => (
              <div className="timeline-item" key={`${activity.date}-${activity.asset}`}>
                <div className="timeline-top">
                  <strong>{activity.employee}</strong>
                  <span className="meta-copy">{activity.date}</span>
                </div>
                <span>{activity.department}</span>
                <span className="meta-copy">{activity.asset}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default OnboardingDashboard;
