import { useState } from "react";
import { assets, employees } from "../data/mockData";

const checklistItems = [
  { key: "deviceReturned", label: "Device returned" },
  { key: "chargerReturned", label: "Charger or power accessories returned" },
  { key: "physicalCondition", label: "Physical condition verified" },
  { key: "dataWiped", label: "Data wipe and security check completed" },
];

function Offboarding() {
  const [employeeId, setEmployeeId] = useState(employees[0].employeeId);
  const [serviceTag, setServiceTag] = useState(assets[0].serviceTag);
  const [comments, setComments] = useState({});
  const [checks, setChecks] = useState(
    checklistItems.reduce((accumulator, item) => ({ ...accumulator, [item.key]: true }), {}),
  );

  const toggleCheck = (key) => {
    setChecks((current) => ({ ...current, [key]: !current[key] }));
  };

  const updateComment = (key) => (event) => {
    setComments((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const invalidItem = checklistItems.find((item) => !checks[item.key] && !comments[item.key]?.trim());
    if (invalidItem) {
      window.alert(`Please add a comment for "${invalidItem.label}" before submitting.`);
      return;
    }

    window.alert(`Asset ${serviceTag} returned successfully for employee ${employeeId}.`);
  };

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Asset Offboarding Module</span>
          <h1>Return issued assets with condition checks and issue comments.</h1>
          <p>
            Capture employee details, product details, and a condition checklist.
            Any unchecked item must include a comment describing the issue.
          </p>
        </div>
      </section>

      <section className="surface-card">
        <h3>Asset Return Form</h3>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="offboard-employee">Employee</label>
              <select id="offboard-employee" className="select-input" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
                {employees.map((employee) => (
                  <option key={employee.employeeId} value={employee.employeeId}>
                    {employee.name} - {employee.employeeId}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="offboard-asset">Product / Asset</label>
              <select id="offboard-asset" className="select-input" value={serviceTag} onChange={(event) => setServiceTag(event.target.value)}>
                {assets.map((asset) => (
                  <option key={asset.serviceTag} value={asset.serviceTag}>
                    {asset.serviceTag} - {asset.brand} {asset.model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="checklist-grid">
            {checklistItems.map((item) => (
              <div className="check-item" key={item.key}>
                <div className="check-header">
                  <input
                    id={item.key}
                    type="checkbox"
                    checked={checks[item.key]}
                    onChange={() => toggleCheck(item.key)}
                  />
                  <label htmlFor={item.key}>{item.label}</label>
                </div>
                {!checks[item.key] && (
                  <textarea
                    className="textarea-input"
                    placeholder="Describe the issue"
                    value={comments[item.key] || ""}
                    onChange={updateComment(item.key)}
                  />
                )}
              </div>
            ))}
          </div>

          <button type="submit" className="button-primary">Submit Return</button>
        </form>
      </section>
    </div>
  );
}

export default Offboarding;
