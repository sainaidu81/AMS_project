import { useMemo, useState } from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import useAdminData from "../context/useAdminData";
import {
  createEmployee,
  deleteEmployee,
  updateEmployee
} from "../services/api";

const EMPTY_FORM = {
  employee_id: "",
  full_name: "",
  department: "",
  designation: "",
  mobile_number: "",
  address: "",
  is_active: true
};

/**
 * Admin employee management screen backed by the employees API.
 *
 * @returns {JSX.Element} the employees management page
 */
export default function Employees() {
  const {
    employees,
    employeesLoading,
    employeesError,
    refreshAdminData
  } = useAdminData();
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter((employee) =>
      [
        employee.employee_id,
        employee.full_name,
        employee.department,
        employee.designation
      ].some((value) => value?.toLowerCase().includes(query))
    );
  }, [employees, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");
    setForm({
      ...form,
      [name]: name === "is_active" ? value === "true" : value
    });
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingEmployeeId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (employee) => {
    setForm({
      employee_id: employee.employee_id,
      full_name: employee.full_name,
      department: employee.department,
      designation: employee.designation,
      mobile_number: employee.mobile_number || "",
      address: employee.address || "",
      is_active: employee.is_active
    });
    setEditingEmployeeId(employee.employee_id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEmployeeId(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const saveEmployee = async () => {
    const normalizedForm = {
      ...form,
      employee_id: form.employee_id.trim(),
      full_name: form.full_name.trim(),
      department: form.department.trim(),
      designation: form.designation.trim(),
      mobile_number: form.mobile_number.trim(),
      address: form.address.trim()
    };

    if (
      !normalizedForm.employee_id ||
      !normalizedForm.full_name ||
      !normalizedForm.department ||
      !normalizedForm.designation
    ) {
      setError("Employee ID, full name, department, and designation are required.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingEmployeeId) {
        await updateEmployee(editingEmployeeId, normalizedForm);
      } else {
        await createEmployee(normalizedForm);
      }

      await refreshAdminData();
      closeForm();
    } catch (err) {
      setError(err.message || "Could not save employee.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEmployee = async (employee) => {
    const confirmDelete = window.confirm(
      `Deactivate ${employee.full_name} and remove their user credentials?`
    );

    if (!confirmDelete) {
      return;
    }

    setActionError("");

    try {
      await deleteEmployee(employee.employee_id);
      await refreshAdminData();
    } catch (err) {
      setActionError(err.message || "Could not deactivate employee.");
    }
  };

  return (
    <div className="employees-page">
      <div className="page-heading">
        <div>
          <p className="dashboard-kicker">Admin</p>
          <h1>Employees</h1>
        </div>

        <button className="primary-action" type="button" onClick={openAddForm}>
          <AddRoundedIcon fontSize="small" />
          Add Employee
        </button>
      </div>

      <div className="users-toolbar">
        <label className="search-field">
          <SearchRoundedIcon fontSize="small" />
          <input
            type="search"
            placeholder="Search employee ID, name, department, or designation"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      {actionError && <p className="form-error">{actionError}</p>}

      <div className="table-card">
        <table className="admin-table employees-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Mobile Number</th>
              <th>Address</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {employeesLoading && (
              <tr>
                <td className="empty-table" colSpan="11">
                  Loading employees...
                </td>
              </tr>
            )}

            {!employeesLoading &&
              filteredEmployees.map((employee) => (
                <tr key={employee.employee_id}>
                  <td>{employee.employee_id}</td>
                  <td>{employee.full_name}</td>
                  <td>{employee.department}</td>
                  <td>{employee.designation}</td>
                  <td>{employee.mobile_number || "-"}</td>
                  <td>{employee.address || "-"}</td>
                  <td>
                    <span className={employee.is_active ? "status-pill active" : "status-pill"}>
                      {employee.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{employee.created_at || "-"}</td>
                  <td>{employee.updated_at || "-"}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-action edit-action"
                        type="button"
                        onClick={() => openEditForm(employee)}
                        aria-label={`Edit ${employee.full_name}`}
                        title="Edit"
                      >
                        <EditRoundedIcon fontSize="small" />
                      </button>

                      <button
                        className="icon-action delete-action"
                        type="button"
                        onClick={() => handleDeleteEmployee(employee)}
                        aria-label={`Delete ${employee.full_name}`}
                        title="Deactivate employee"
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!employeesLoading && employeesError && (
              <tr>
                <td className="empty-table error-text" colSpan="11">
                  {employeesError}
                </td>
              </tr>
            )}

            {!employeesLoading && !employeesError && filteredEmployees.length === 0 && (
              <tr>
                <td className="empty-table" colSpan="11">
                  No employees match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-panel employee-modal" role="dialog" aria-modal="true">
            <h2>{editingEmployeeId ? "Edit Employee" : "Add Employee"}</h2>

            <div className="form-grid">
              <label>
                Employee ID
                <input
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  disabled={Boolean(editingEmployeeId)}
                />
              </label>

              <label>
                Full Name
                <input name="full_name" value={form.full_name} onChange={handleChange} />
              </label>

              <label>
                Department
                <input name="department" value={form.department} onChange={handleChange} />
              </label>

              <label>
                Designation
                <input
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                />
              </label>

              <label>
                Mobile Number
                <input
                  name="mobile_number"
                  value={form.mobile_number}
                  onChange={handleChange}
                />
              </label>

              <label>
                Status
                <select
                  name="is_active"
                  value={String(form.is_active)}
                  onChange={handleChange}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>

              <label className="full-span">
                Address
                <input name="address" value={form.address} onChange={handleChange} />
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button className="secondary-action" type="button" onClick={closeForm}>
                Cancel
              </button>
              <button
                className="primary-action"
                type="button"
                onClick={saveEmployee}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : editingEmployeeId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}