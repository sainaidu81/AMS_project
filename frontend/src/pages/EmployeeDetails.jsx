import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { employees } from "../data/mockData";

function EmployeeDetails() {
  const { employeeId } = useParams();
  const employee = useMemo(
    () => employees.find((item) => item.employeeId === employeeId) || employees[0],
    [employeeId],
  );

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Employee Record</span>
          <h1>{employee.name} profile, assigned assets, and lifecycle history.</h1>
          <p>
            Review employee identity, department, address, current assignments, and
            historical onboarding or support records from one page.
          </p>
        </div>
      </section>

      <div className="detail-grid">
        <section className="surface-card">
          <h3>Employee Information</h3>
          <div className="detail-list">
            <div className="detail-item"><span>Employee ID</span><strong>{employee.employeeId}</strong></div>
            <div className="detail-item"><span>Department</span><strong>{employee.department}</strong></div>
            <div className="detail-item"><span>Designation</span><strong>{employee.designation}</strong></div>
            <div className="detail-item"><span>Mobile</span><strong>{employee.mobile}</strong></div>
            <div className="detail-item"><span>Address</span><strong>{employee.address}</strong></div>
            <div className="detail-item"><span>Location</span><strong>{employee.location}</strong></div>
            <div className="detail-item"><span>Manager</span><strong>{employee.manager}</strong></div>
            <div className="detail-item"><span>Join Date</span><strong>{employee.joinDate}</strong></div>
          </div>
        </section>

        <section className="table-card">
          <h3>Assigned Assets</h3>
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset Type</th>
                  <th>Service Tag</th>
                  <th>Assignment Status</th>
                </tr>
              </thead>
              <tbody>
                {employee.assets.map((asset) => (
                  <tr key={asset.serviceTag}>
                    <td>{asset.assetType}</td>
                    <td>{asset.serviceTag}</td>
                    <td>{asset.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="timeline-card">
        <h3>Onboarding and Offboarding History</h3>
        <div className="timeline-list">
          {employee.history.map((entry) => (
            <div className="timeline-item" key={`${entry.date}-${entry.action}`}>
              <div className="timeline-top">
                <strong>{entry.action}</strong>
                <span className="meta-copy">{entry.date}</span>
              </div>
              <span className="meta-copy">{entry.note}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default EmployeeDetails;
