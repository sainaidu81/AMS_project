import { useMemo, useState } from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const EMPTY_FORM = {
  employee_id: "",
  email: "",
  role: "",
  created_at: "",
  updated_at: ""
};

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "it_manager", label: "IT Manager" },
  { value: "employee", label: "Employee" }
];

const INITIAL_USERS = [
  {
    employee_id: "EMP-001",
    email: "admin@ams.local",
    role: "admin",
    created_at: "2026-05-16",
    updated_at: "2026-05-16"
  }
];

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Frontend-only admin user management screen.
 *
 * @returns {JSX.Element} the users management page
 */
export default function Users() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [user.employee_id, user.email, user.role].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [search, users]);

  const handleChange = (event) => {
    setError("");
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const openAddForm = () => {
    setForm({
      ...EMPTY_FORM,
      created_at: today(),
      updated_at: today()
    });
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

  const saveUser = () => {
    const normalizedForm = {
      ...form,
      employee_id: form.employee_id.trim(),
      email: form.email.trim(),
      updated_at: today()
    };

    if (!normalizedForm.employee_id || !normalizedForm.email || !normalizedForm.role) {
      setError("Employee ID, email, and role are required.");
      return;
    }

    if (editIndex !== null) {
      const updatedUsers = [...users];
      updatedUsers[editIndex] = normalizedForm;
      setUsers(updatedUsers);
    } else {
      setUsers([
        ...users,
        {
          ...normalizedForm,
          created_at: normalizedForm.created_at || today()
        }
      ]);
    }

    closeForm();
  };

  const editUser = (index) => {
    setForm(users[index]);
    setEditIndex(index);
    setError("");
    setShowForm(true);
  };

  const deleteUser = (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");

    if (confirmDelete) {
      setUsers(users.filter((_, userIndex) => userIndex !== index));
    }
  };

  return (
    <div className="users-page">
      <div className="page-heading">
        <div>
          <p className="dashboard-kicker">Admin</p>
          <h1>Users</h1>
        </div>

        <button className="primary-action" type="button" onClick={openAddForm}>
          <AddRoundedIcon fontSize="small" />
          Add User
        </button>
      </div>

      <div className="users-toolbar">
        <label className="search-field">
          <SearchRoundedIcon fontSize="small" />
          <input
            type="search"
            placeholder="Search employee ID, email, or role"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      <div className="table-card">
        <table className="users-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => {
              const realIndex = users.indexOf(user);

              return (
                <tr key={`${user.employee_id}-${user.email}`}>
                  <td>{user.employee_id}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="role-pill">{user.role}</span>
                  </td>
                  <td>{user.created_at}</td>
                  <td>{user.updated_at}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-action edit-action"
                        type="button"
                        onClick={() => editUser(realIndex)}
                        aria-label={`Edit ${user.email}`}
                        title="Edit"
                      >
                        <EditRoundedIcon fontSize="small" />
                      </button>

                      <button
                        className="icon-action delete-action"
                        type="button"
                        onClick={() => deleteUser(realIndex)}
                        aria-label={`Delete ${user.email}`}
                        title="Delete"
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td className="empty-table" colSpan="6">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-panel" role="dialog" aria-modal="true">
            <h2>{editIndex !== null ? "Edit User" : "Add User"}</h2>

            <label>
              Employee ID
              <input
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </label>

            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="">Select Role</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button className="secondary-action" type="button" onClick={closeForm}>
                Cancel
              </button>
              <button className="primary-action" type="button" onClick={saveUser}>
                {editIndex !== null ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
