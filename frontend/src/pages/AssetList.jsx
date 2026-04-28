import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../data/mockData";

function AssetList() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredAssets = useMemo(
    () =>
      assets.filter((asset) => {
        const matchesSearch =
          asset.serviceTag.toLowerCase().includes(search.toLowerCase()) ||
          asset.brand.toLowerCase().includes(search.toLowerCase()) ||
          asset.model.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "All" || asset.assetType === typeFilter;
        const matchesStatus = statusFilter === "All" || asset.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
      }),
    [search, typeFilter, statusFilter],
  );

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Stock List Module</span>
          <h1>View every registered asset with service-tag search and status filters.</h1>
          <p>
            Managers can search by service tag, filter by asset type or current status,
            and move directly into the full asset details page.
          </p>
        </div>
      </section>

      <section className="table-card">
        <div className="toolbar">
          <input
            className="text-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by service tag, brand, or model"
          />
          <select className="select-input" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option>All</option>
            <option>Laptop</option>
            <option>Mobile</option>
            <option>Mouse</option>
          </select>
          <select className="select-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option>All</option>
            <option>Available</option>
            <option>Assigned</option>
            <option>Maintenance</option>
            <option>Retired</option>
          </select>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service Tag</th>
                <th>Asset</th>
                <th>Serial Number</th>
                <th>Location</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.serviceTag}>
                  <td><strong>{asset.serviceTag}</strong></td>
                  <td>
                    <div className="split-value">
                      <strong>{asset.brand} {asset.model}</strong>
                      <span className="meta-copy">{asset.assetType}</span>
                    </div>
                  </td>
                  <td>{asset.serialNumber}</td>
                  <td>{asset.location}</td>
                  <td>
                    <span className={`status-badge status-${asset.status.toLowerCase()}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>{asset.assignedEmployee || "Not assigned"}</td>
                  <td>
                    <Link className="inline-link" to={`/assets/${asset.serviceTag}`}>
                      Open record
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AssetList;
