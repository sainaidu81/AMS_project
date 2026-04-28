import { useMemo, useState } from "react";
import { assets, employees } from "../data/mockData";

const initialForm = {
  employeeId: employees[0].employeeId,
  serviceTag: assets.find((asset) => asset.status === "Available")?.serviceTag || assets[0].serviceTag,
  companyName: "ACME",
  device: "LAPTOP",
  location: employees[0].location.toUpperCase(),
  designation: employees[0].designation.toUpperCase(),
  yom: "2026",
  customId: employees[0].employeeId.replace("EMP-", ""),
};

function Onboarding() {
  const [form, setForm] = useState(initialForm);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.employeeId === form.employeeId) || employees[0],
    [form.employeeId],
  );

  const hostname = `${form.companyName}-${form.device}-${form.location}-${form.designation}-${form.yom}-${form.customId}`;

  const updateField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    window.alert(`Asset ${form.serviceTag} assigned to ${selectedEmployee.name}. Hostname: ${hostname}`);
  };

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Asset Onboarding Module</span>
          <h1>Issue assets to employees with a structured hostname and assignment record.</h1>
          <p>
            Enter employee and asset details, generate the hostname in the required structure,
            and complete the assignment from this page.
          </p>
        </div>
      </section>

      <div className="detail-grid">
        <section className="surface-card">
          <h3>Asset Issuing Form</h3>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="employee">Employee</label>
                <select id="employee" className="select-input" value={form.employeeId} onChange={updateField("employeeId")}>
                  {employees.map((employee) => (
                    <option key={employee.employeeId} value={employee.employeeId}>
                      {employee.name} - {employee.employeeId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="asset">Asset Service Tag</label>
                <select id="asset" className="select-input" value={form.serviceTag} onChange={updateField("serviceTag")}>
                  {assets.map((asset) => (
                    <option key={asset.serviceTag} value={asset.serviceTag}>
                      {asset.serviceTag} - {asset.assetType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="company">Company Name</label>
                <input id="company" className="text-input" value={form.companyName} onChange={updateField("companyName")} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="device">Device</label>
                <input id="device" className="text-input" value={form.device} onChange={updateField("device")} />
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="location">Location</label>
                <input id="location" className="text-input" value={form.location} onChange={updateField("location")} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="designation">Designation</label>
                <input id="designation" className="text-input" value={form.designation} onChange={updateField("designation")} />
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="yom">YOM</label>
                <input id="yom" className="text-input" value={form.yom} onChange={updateField("yom")} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="custom-id">ID</label>
                <input id="custom-id" className="text-input" value={form.customId} onChange={updateField("customId")} />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="hostname">Generated Host Name</label>
              <input id="hostname" className="text-input" value={hostname} readOnly />
              <p className="field-help">Format: Company Name - Device - Location - Designation - YOM - ID</p>
            </div>

            <button type="submit" className="button-primary">Submit Assignment</button>
          </form>
        </section>

        <section className="surface-card">
          <h3>Assignment Preview</h3>
          <div className="detail-list">
            <div className="detail-item"><span>Employee</span><strong>{selectedEmployee.name}</strong></div>
            <div className="detail-item"><span>Employee ID</span><strong>{selectedEmployee.employeeId}</strong></div>
            <div className="detail-item"><span>Department</span><strong>{selectedEmployee.department}</strong></div>
            <div className="detail-item"><span>Location</span><strong>{selectedEmployee.location}</strong></div>
            <div className="detail-item"><span>Hostname</span><strong>{hostname}</strong></div>
            <div className="detail-item"><span>Issued Asset</span><strong>{form.serviceTag}</strong></div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Onboarding;
