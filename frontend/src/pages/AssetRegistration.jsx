import { useState } from "react";
import { assets } from "../data/mockData";

const initialForm = {
  assetType: "Laptop",
  serviceTag: "",
  brand: "",
  model: "",
  serialNumber: "",
  manufacturedDate: "",
  ram: "",
  storage: "",
  os: "",
};

function AssetRegistration() {
  const [form, setForm] = useState(initialForm);

  const updateField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    window.alert(`Asset ${form.serviceTag || "new asset"} registered successfully.`);
    setForm(initialForm);
  };

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Asset Registration Module</span>
          <h1>Register laptops, mobiles, mice, and other organization devices.</h1>
          <p>
            Every device is stored with a service tag, brand, model, serial number,
            manufacture date, and basic configuration details.
          </p>
        </div>
      </section>

      <div className="detail-grid">
        <section className="surface-card">
          <h3>Register New Asset</h3>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="asset-type">Asset Type</label>
                <select id="asset-type" className="select-input" value={form.assetType} onChange={updateField("assetType")}>
                  <option>Laptop</option>
                  <option>Mobile</option>
                  <option>Mouse</option>
                  <option>Keyboard</option>
                  <option>Monitor</option>
                </select>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="service-tag">Service Tag</label>
                <input id="service-tag" className="text-input" value={form.serviceTag} onChange={updateField("serviceTag")} placeholder="Unique ID for the asset" required />
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="brand">Brand</label>
                <input id="brand" className="text-input" value={form.brand} onChange={updateField("brand")} placeholder="Dell, HP, Samsung" required />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="model">Model</label>
                <input id="model" className="text-input" value={form.model} onChange={updateField("model")} placeholder="Model name or number" required />
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="serial">Serial Number</label>
                <input id="serial" className="text-input" value={form.serialNumber} onChange={updateField("serialNumber")} placeholder="Manufacturer serial number" required />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="manufactured-date">Manufactured Date</label>
                <input id="manufactured-date" className="text-input" type="date" value={form.manufacturedDate} onChange={updateField("manufacturedDate")} required />
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="ram">RAM</label>
                <input id="ram" className="text-input" value={form.ram} onChange={updateField("ram")} placeholder="8 GB, 16 GB, N/A" />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="storage">Storage</label>
                <input id="storage" className="text-input" value={form.storage} onChange={updateField("storage")} placeholder="256 GB SSD, N/A" />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="os">Operating System</label>
              <input id="os" className="text-input" value={form.os} onChange={updateField("os")} placeholder="Windows 11 Pro, Android 14, N/A" />
            </div>

            <div className="button-row">
              <button type="submit" className="button-primary">Register Asset</button>
              <button type="button" className="button-secondary" onClick={() => setForm(initialForm)}>Reset</button>
            </div>
          </form>
        </section>

        <section className="table-card">
          <h3>Recently Registered Assets</h3>
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service Tag</th>
                  <th>Type</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Manufactured</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.serviceTag}>
                    <td>{asset.serviceTag}</td>
                    <td>{asset.assetType}</td>
                    <td>{asset.brand}</td>
                    <td>{asset.model}</td>
                    <td>{asset.manufacturedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AssetRegistration;
