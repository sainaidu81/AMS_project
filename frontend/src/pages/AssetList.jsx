import { useMemo, useState } from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import useAdminData from "../context/useAdminData";
import {
  createAsset,
  deleteAsset,
  updateAsset
} from "../services/api";

const EMPTY_FORM = {
  service_tag: "",
  asset_type: "",
  brand: "",
  model: "",
  serial_number: "",
  manufactured_date: "",
  ram: "",
  storage_capacity: "",
  operating_system: "",
  status: "available"
};

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "assigned", label: "Assigned" },
  { value: "maintenance", label: "Maintenance" },
  { value: "retired", label: "Retired" }
];

const searchableAssetValues = (asset) => [
  asset.service_tag,
  asset.asset_type,
  asset.brand,
  asset.model,
  asset.serial_number,
  asset.manufactured_date,
  asset.ram,
  asset.storage_capacity,
  asset.operating_system,
  asset.status
];

/**
 * Admin asset management screen backed by the assets API.
 *
 * @returns {JSX.Element} the assets management page
 */
export default function AssetList() {
  const {
    assets,
    assetsLoading,
    assetsError,
    refreshAdminData
  } = useAdminData();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingServiceTag, setEditingServiceTag] = useState(null);
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return assets;
    }

    return assets.filter((asset) =>
      searchableAssetValues(asset).some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [assets, search]);

  const handleChange = (event) => {
    setFormError("");
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingServiceTag(null);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (asset) => {
    setForm({
      service_tag: asset.service_tag,
      asset_type: asset.asset_type || "",
      brand: asset.brand || "",
      model: asset.model || "",
      serial_number: asset.serial_number || "",
      manufactured_date: asset.manufactured_date || "",
      ram: asset.ram || "",
      storage_capacity: asset.storage_capacity || "",
      operating_system: asset.operating_system || "",
      status: asset.status || "available"
    });
    setEditingServiceTag(asset.service_tag);
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingServiceTag(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const saveAsset = async () => {
    const normalizedForm = {
      service_tag: form.service_tag.trim(),
      asset_type: form.asset_type.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      serial_number: form.serial_number.trim(),
      manufactured_date: form.manufactured_date,
      ram: form.ram.trim(),
      storage_capacity: form.storage_capacity.trim(),
      operating_system: form.operating_system.trim(),
      status: form.status
    };

    if (
      !normalizedForm.service_tag ||
      !normalizedForm.asset_type ||
      !normalizedForm.brand ||
      !normalizedForm.model ||
      !normalizedForm.serial_number ||
      !normalizedForm.status
    ) {
      setFormError("Service tag, asset type, brand, model, serial number, and status are required.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingServiceTag) {
        await updateAsset(editingServiceTag, normalizedForm);
      } else {
        await createAsset(normalizedForm);
      }

      await refreshAdminData();
      closeForm();
    } catch (err) {
      setFormError(err.message || "Could not save asset.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAsset = async (asset) => {
    const confirmDelete = window.confirm(`Delete asset ${asset.service_tag}?`);

    if (!confirmDelete) {
      return;
    }

    setActionError("");

    try {
      await deleteAsset(asset.service_tag);
      await refreshAdminData();
    } catch (err) {
      setActionError(err.message || "Could not delete asset.");
    }
  };

  return (
    <div className="assets-page">
      <div className="page-heading">
  <button
    className="primary-action"
    type="button"
    onClick={openAddForm}
  >
    <AddRoundedIcon fontSize="small" />
    Add Asset
  </button>
</div>

      <div className="users-toolbar">
        <label className="search-field">
          <SearchRoundedIcon fontSize="small" />
          <input
            type="search"
            placeholder="Search asset details"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      {actionError && <p className="form-error">{actionError}</p>}

      <div className="table-card">
        <table className="admin-table assets-table">
          <thead>
            <tr>
              <th>Service Tag</th>
              <th>Asset Type</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Serial Number</th>
              <th>Manufacture Date</th>
              <th>RAM</th>
              <th>Storage Capacity</th>
              <th>Operating System</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {assetsLoading && (
              <tr>
                <td className="empty-table" colSpan="11">
                  Loading assets...
                </td>
              </tr>
            )}

            {!assetsLoading &&
              filteredAssets.map((asset) => (
                <tr key={asset.service_tag}>
                  <td>{asset.service_tag}</td>
                  <td>{asset.asset_type}</td>
                  <td>{asset.brand}</td>
                  <td>{asset.model}</td>
                  <td>{asset.serial_number}</td>
                  <td>{asset.manufactured_date || "-"}</td>
                  <td>{asset.ram || "-"}</td>
                  <td>{asset.storage_capacity || "-"}</td>
                  <td>{asset.operating_system || "-"}</td>
                  <td>
                    <span className={`status-pill asset-status ${asset.status}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-action edit-action"
                        type="button"
                        onClick={() => openEditForm(asset)}
                        aria-label={`Edit ${asset.service_tag}`}
                        title="Edit"
                      >
                        <EditRoundedIcon fontSize="small" />
                      </button>

                      <button
                        className="icon-action delete-action"
                        type="button"
                        onClick={() => handleDeleteAsset(asset)}
                        aria-label={`Delete ${asset.service_tag}`}
                        title="Delete asset"
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!assetsLoading && assetsError && (
              <tr>
                <td className="empty-table error-text" colSpan="11">
                  {assetsError}
                </td>
              </tr>
            )}

            {!assetsLoading && !assetsError && filteredAssets.length === 0 && (
              <tr>
                <td className="empty-table" colSpan="11">
                  No assets match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-panel asset-modal" role="dialog" aria-modal="true">
            <h2>{editingServiceTag ? "Edit Asset" : "Add Asset"}</h2>

            <div className="form-grid">
              <label>
                Service Tag
                <input
                  name="service_tag"
                  value={form.service_tag}
                  onChange={handleChange}
                  disabled={Boolean(editingServiceTag)}
                />
              </label>

              <label>
                Asset Type
                <input name="asset_type" value={form.asset_type} onChange={handleChange} />
              </label>

              <label>
                Brand
                <input name="brand" value={form.brand} onChange={handleChange} />
              </label>

              <label>
                Model
                <input name="model" value={form.model} onChange={handleChange} />
              </label>

              <label>
                Serial Number
                <input
                  name="serial_number"
                  value={form.serial_number}
                  onChange={handleChange}
                />
              </label>

              <label>
                Manufacture Date
                <input
                  name="manufactured_date"
                  type="date"
                  value={form.manufactured_date}
                  onChange={handleChange}
                />
              </label>

              <label>
                RAM
                <input name="ram" value={form.ram} onChange={handleChange} />
              </label>

              <label>
                Storage Capacity
                <input
                  name="storage_capacity"
                  value={form.storage_capacity}
                  onChange={handleChange}
                />
              </label>

              <label>
                Operating System
                <input
                  name="operating_system"
                  value={form.operating_system}
                  onChange={handleChange}
                />
              </label>

              <label>
                Status
                <select name="status" value={form.status} onChange={handleChange}>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {formError && <p className="form-error">{formError}</p>}

            <div className="modal-actions">
              <button className="secondary-action" type="button" onClick={closeForm}>
                Cancel
              </button>
              <button
                className="primary-action"
                type="button"
                onClick={saveAsset}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : editingServiceTag ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
