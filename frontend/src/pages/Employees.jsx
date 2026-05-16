import { useMemo, useState } from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const EMPTY_FORM = {
  employee_id: "",
  full_name: "",
  department: "",
  designation: "",
  mobile_number: "",
  address: "",
  is_active: true
};

const INITIAL_EMPLOYEES = [
  {
    employee_id: "EMP-001",
    full_name: "Admin User",
    department: "Administration",
    designation: "System Admin",
    mobile_number: "",
    address: "",
    is_active: true
  }
];

/**
 * Frontend-only admin employee management screen.
 *
 * @returns {JSX.Element} the employees management page
 */
export default function Employees() {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState("");

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
      ].some((value) => value.toLowerCase().includes(query))
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
    setEditIndex(null);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditIndex(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const saveEmployee = () => {
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

    if (editIndex !== null) {
      const updatedEmployees = [...employees];
      updatedEmployees[editIndex] = normalizedForm;
      setEmployees(updatedEmployees);
    } else {
      setEmployees([...employees, normalizedForm]);
    }

    closeForm();
  };

  const editEmployee = (index) => {
    setForm(employees[index]);
    setEditIndex(index);
    setError("");
    setShowForm(true);
  };

  const deleteEmployee = (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");

    if (confirmDelete) {
      setEmployees(employees.filter((_, employeeIndex) => employeeIndex !== index));
    }
  };

  const updateActiveStatus = (index, isActive) => {
    const updatedEmployees = [...employees];
    updatedEmployees[index] = {
      ...updatedEmployees[index],
      is_active: isActive
    };
    setEmployees(updatedEmployees);
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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((employee) => {
              const realIndex = employees.indexOf(employee);

              return (
                <tr key={employee.employee_id}>
                  <td>{employee.employee_id}</td>
                  <td>{employee.full_name}</td>
                  <td>{employee.department}</td>
                  <td>{employee.designation}</td>
                  <td>{employee.mobile_number || "-"}</td>
                  <td>{employee.address || "-"}</td>
                  <td>
                    <select
                      className="status-select"
                      value={String(employee.is_active)}
                      onChange={(event) =>
                        updateActiveStatus(realIndex, event.target.value === "true")
                      }
                      aria-label={`Set status for ${employee.full_name}`}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-action edit-action"
                        type="button"
                        onClick={() => editEmployee(realIndex)}
                        aria-label={`Edit ${employee.full_name}`}
                        title="Edit"
                      >
                        <EditRoundedIcon fontSize="small" />
                      </button>

                      <button
                        className="icon-action delete-action"
                        type="button"
                        onClick={() => deleteEmployee(realIndex)}
                        aria-label={`Delete ${employee.full_name}`}
                        title="Delete"
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredEmployees.length === 0 && (
              <tr>
                <td className="empty-table" colSpan="8">
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
            <h2>{editIndex !== null ? "Edit Employee" : "Add Employee"}</h2>

            <div className="form-grid">
              <label>
                Employee ID
                <input
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
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
              <button className="primary-action" type="button" onClick={saveEmployee}>
                {editIndex !== null ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
