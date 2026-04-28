import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../data/mockData";

function AssetDetails() {
  const { serviceTag } = useParams();
  const asset = useMemo(
    () => assets.find((item) => item.serviceTag === serviceTag) || assets[0],
    [serviceTag],
  );

  const [config, setConfig] = useState({
    ram: asset.ram,
    storage: asset.storage,
    os: asset.os,
    notes: asset.notes,
  });

  const updateField = (key) => (event) => {
    setConfig((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    window.alert(`Configuration updates for ${asset.serviceTag} have been saved.`);
  };

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Asset Details Module</span>
          <h1>{asset.serviceTag} full asset record and configuration updates.</h1>
          <p>
            Review asset identity, configuration, assignment state, and lifecycle history.
            Managers can update RAM, storage, OS, and other hardware notes from here.
          </p>
        </div>
      </section>

      <div className="detail-grid">
        <section className="surface-card">
          <h3>Asset Information</h3>
          <div className="detail-list">
            <div className="detail-item"><span>Service Tag</span><strong>{asset.serviceTag}</strong></div>
            <div className="detail-item"><span>Status</span><strong>{asset.status}</strong></div>
            <div className="detail-item"><span>Brand</span><strong>{asset.brand}</strong></div>
            <div className="detail-item"><span>Model</span><strong>{asset.model}</strong></div>
            <div className="detail-item"><span>Serial Number</span><strong>{asset.serialNumber}</strong></div>
            <div className="detail-item"><span>Manufactured Date</span><strong>{asset.manufacturedDate}</strong></div>
            <div className="detail-item"><span>Assigned Employee</span><strong>{asset.assignedEmployee || "Unassigned"}</strong></div>
            <div className="detail-item"><span>Hostname</span><strong>{asset.hostname}</strong></div>
          </div>
        </section>

        <section className="surface-card">
          <h3>Update Configuration</h3>
          <form className="auth-form" onSubmit={handleSave}>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="ram">RAM</label>
                <input id="ram" className="text-input" value={config.ram} onChange={updateField("ram")} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="storage">Storage</label>
                <input id="storage" className="text-input" value={config.storage} onChange={updateField("storage")} />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="os">Operating System</label>
              <input id="os" className="text-input" value={config.os} onChange={updateField("os")} />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="notes">Hardware Change Notes</label>
              <textarea id="notes" className="textarea-input" value={config.notes} onChange={updateField("notes")} />
            </div>

            <button type="submit" className="button-primary">Save Updates</button>
          </form>
        </section>
      </div>

      <div className="timeline-grid">
        <section className="timeline-card">
          <h3>Asset History</h3>
          <div className="timeline-list">
            {asset.history.map((entry) => (
              <div className="timeline-item" key={`${entry.date}-${entry.action}`}>
                <div className="timeline-top">
                  <strong>{entry.action}</strong>
                  <span className="meta-copy">{entry.date}</span>
                </div>
                <span>{entry.owner}</span>
                <span className="meta-copy">{entry.note}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card">
          <h3>Current Snapshot</h3>
          <div className="progress-list">
            <div className="progress-item">
              <div className="progress-top"><span>Configuration Health</span><span>92%</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: "92%" }} /></div>
            </div>
            <div className="progress-item">
              <div className="progress-top"><span>Warranty Coverage</span><span>{asset.warrantyEnd}</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: "78%" }} /></div>
            </div>
            <div className="progress-item">
              <div className="progress-top"><span>Assignment State</span><span>{asset.assignedEmployee ? "Mapped" : "Open"}</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: asset.assignedEmployee ? "88%" : "40%" }} /></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AssetDetails;
