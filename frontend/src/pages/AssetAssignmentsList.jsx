import { useMemo, useState } from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import useAdminData from "../context/useAdminData";
import {
  createAssetAssignment,
  deleteAssetAssignment,
  updateAssetAssignment
} from "../services/api";

const EMPTY_FORM = {
  service_tag: "",
  employee_id: "",
  issued_by_emp_id: "",
  issued_date: "",
  return_date: "",
  return_by_emp_id: "",
  asset_condition: "",
  issue_found: "",
  issue_comment: ""
};

const searchableAssignmentValues = (assignment) => [
  assignment.id,
  assignment.service_tag,
  assignment.employee_id,
  assignment.issued_by_emp_id,
  assignment.issued_date,
  assignment.host_name,
  assignment.return_date,
  assignment.return_by_emp_id,
  assignment.asset_condition,
  String(assignment.issue_found ?? ""),
  assignment.issue_comment
];

const toDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  return value.replace(" ", "T").slice(0, 16);
};

/**
 * Admin asset assignment management screen backed by the asset assignments API.
 *
 * @returns {JSX.Element} the asset assignments management page
 */
export default function AssetAssignmentsList() {
  const {
    assetAssignments,
    assetAssignmentsLoading,
    assetAssignmentsError,
    assets,
    employees,
    refreshAdminData
  } = useAdminData();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return assetAssignments;
    }

    return assetAssignments.filter((assignment) =>
      searchableAssignmentValues(assignment).some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [assetAssignments, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormError("");
    setForm({
      ...form,
      [name]: value
    });
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingAssignmentId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (assignment) => {
    setForm({
      service_tag: assignment.service_tag || "",
      employee_id: assignment.employee_id || "",
      issued_by_emp_id: assignment.issued_by_emp_id || "",
      issued_date: toDateTimeLocal(assignment.issued_date),
      return_date: toDateTimeLocal(assignment.return_date),
      return_by_emp_id: assignment.return_by_emp_id || "",
      asset_condition: assignment.asset_condition || "",
      issue_found:
        assignment.issue_found === null || assignment.issue_found === undefined
          ? ""
          : String(assignment.issue_found),
      issue_comment: assignment.issue_comment || ""
    });
    setEditingAssignmentId(assignment.id);
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAssignmentId(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const saveAssignment = async () => {
    const normalizedForm = {
      service_tag: form.service_tag.trim(),
      employee_id: form.employee_id.trim(),
      issued_by_emp_id: form.issued_by_emp_id.trim(),
      issued_date: form.issued_date,
      return_date: form.return_date,
      return_by_emp_id: form.return_by_emp_id.trim(),
      asset_condition: form.asset_condition.trim(),
      issue_found: form.issue_found === "" ? "" : form.issue_found === "true",
      issue_comment: form.issue_comment.trim()
    };

    if (!normalizedForm.service_tag || !normalizedForm.employee_id) {
      setFormError("Service tag and employee ID are required.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingAssignmentId) {
        await updateAssetAssignment(editingAssignmentId, normalizedForm);
      } else {
        await createAssetAssignment(normalizedForm);
      }

      await refreshAdminData();
      closeForm();
    } catch (err) {
      setFormError(err.message || "Could not save asset assignment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAssignment = async (assignment) => {
    const confirmDelete = window.confirm(
      `Delete assignment ${assignment.id} for ${assignment.service_tag}?`
    );

    if (!confirmDelete) {
      return;
    }

    setActionError("");

    try {
      await deleteAssetAssignment(assignment.id);
      await refreshAdminData();
    } catch (err) {
      setActionError(err.message || "Could not delete asset assignment.");
    }
  };

  return (
    <div className="asset-assignments-page">
      <div className="page-heading">
        <div>
          <p className="dashboard-kicker">Admin</p>
          <h1>Asset Assignments</h1>
        </div>

        <button className="primary-action" type="button" onClick={openAddForm}>
          <AddRoundedIcon fontSize="small" />
          Add Assignment
        </button>
      </div>

      <div className="users-toolbar">
        <label className="search-field">
          <SearchRoundedIcon fontSize="small" />
          <input
            type="search"
            placeholder="Search assignment details"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      {actionError && <p className="form-error">{actionError}</p>}

      <div className="table-card">
        <table className="admin-table asset-assignments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Service Tag</th>
              <th>Employee ID</th>
              <th>Issued By Employee ID</th>
              <th>Issue Date</th>
              <th>Host Name</th>
              <th>Return Date</th>
              <th>Return By Employee ID</th>
              <th>Asset Condition</th>
              <th>Issue Found</th>
              <th>Issue Comment</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {assetAssignmentsLoading && (
              <tr>
                <td className="empty-table" colSpan="12">
                  Loading asset assignments...
                </td>
              </tr>
            )}

            {!assetAssignmentsLoading &&
              filteredAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.id}</td>
                  <td>{assignment.service_tag}</td>
                  <td>{assignment.employee_id}</td>
                  <td>{assignment.issued_by_emp_id || "-"}</td>
                  <td>{assignment.issued_date || "-"}</td>
                  <td>{assignment.host_name || "-"}</td>
                  <td>{assignment.return_date || "-"}</td>
                  <td>{assignment.return_by_emp_id || "-"}</td>
                  <td>{assignment.asset_condition || "-"}</td>
                  <td>
                    {assignment.issue_found === null || assignment.issue_found === undefined ? (
                      "-"
                    ) : (
                      <span className={assignment.issue_found ? "status-pill" : "status-pill active"}>
                        {assignment.issue_found ? "Yes" : "No"}
                      </span>
                    )}
                  </td>
                  <td>{assignment.issue_comment || "-"}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-action edit-action"
                        type="button"
                        onClick={() => openEditForm(assignment)}
                        aria-label={`Edit assignment ${assignment.id}`}
                        title="Edit"
                      >
                        <EditRoundedIcon fontSize="small" />
                      </button>

                      <button
                        className="icon-action delete-action"
                        type="button"
                        onClick={() => handleDeleteAssignment(assignment)}
                        aria-label={`Delete assignment ${assignment.id}`}
                        title="Delete assignment"
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!assetAssignmentsLoading && assetAssignmentsError && (
              <tr>
                <td className="empty-table error-text" colSpan="12">
                  {assetAssignmentsError}
                </td>
              </tr>
            )}

            {!assetAssignmentsLoading && !assetAssignmentsError && filteredAssignments.length === 0 && (
              <tr>
                <td className="empty-table" colSpan="12">
                  No asset assignments match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-panel assignment-modal" role="dialog" aria-modal="true">
            <h2>{editingAssignmentId ? "Edit Assignment" : "Add Assignment"}</h2>

            <div className="form-grid">
              <label>
                Service Tag
                <input
                  name="service_tag"
                  list="assignment-service-tags"
                  value={form.service_tag}
                  onChange={handleChange}
                />
              </label>

              <label>
                Employee ID
                <input
                  name="employee_id"
                  list="assignment-employee-ids"
                  value={form.employee_id}
                  onChange={handleChange}
                />
              </label>

              <label>
                Issued By Employee ID
                <input
                  name="issued_by_emp_id"
                  list="assignment-employee-ids"
                  value={form.issued_by_emp_id}
                  onChange={handleChange}
                />
              </label>

              <label>
                Issue Date
                <input
                  name="issued_date"
                  type="datetime-local"
                  value={form.issued_date}
                  onChange={handleChange}
                />
              </label>

              <label>
                Return Date
                <input
                  name="return_date"
                  type="datetime-local"
                  value={form.return_date}
                  onChange={handleChange}
                />
              </label>

              <label>
                Return By Employee ID
                <input
                  name="return_by_emp_id"
                  list="assignment-employee-ids"
                  value={form.return_by_emp_id}
                  onChange={handleChange}
                />
              </label>

              <label>
                Issue Found
                <select name="issue_found" value={form.issue_found} onChange={handleChange}>
                  <option value="">Blank</option>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>

              <label className="full-span">
                Asset Condition
                <input
                  name="asset_condition"
                  value={form.asset_condition}
                  onChange={handleChange}
                />
              </label>

              <label className="full-span">
                Issue Comment
                <input
                  name="issue_comment"
                  value={form.issue_comment}
                  onChange={handleChange}
                />
              </label>
            </div>

            <datalist id="assignment-service-tags">
              {assets.map((asset) => (
                <option key={asset.service_tag} value={asset.service_tag} />
              ))}
            </datalist>

            <datalist id="assignment-employee-ids">
              {employees.map((employee) => (
                <option key={employee.employee_id} value={employee.employee_id} />
              ))}
            </datalist>

            {formError && <p className="form-error">{formError}</p>}

            <div className="modal-actions">
              <button className="secondary-action" type="button" onClick={closeForm}>
                Cancel
              </button>
              <button
                className="primary-action"
                type="button"
                onClick={saveAssignment}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : editingAssignmentId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
