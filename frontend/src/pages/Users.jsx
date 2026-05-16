import { useEffect, useMemo, useState } from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import { createUser, deleteUser, getUsers, updateUser } from "../services/api";

const EMPTY_FORM = {
  employee_id: "",
  full_name: "",
  email: "",
  role: "",
  password: ""
};

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "it_manager", label: "IT Manager" },
  { value: "employee", label: "Employee" }
];

/**
 * Admin user management screen backed by the users API.
 *
 * @returns {JSX.Element} the users management page
 */
export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const data = await getUsers();
      setUsers(data.users || []);
    } catch (err) {
      setLoadError(err.message || "Could not load users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let shouldUpdate = true;

    getUsers()
      .then((data) => {
        if (shouldUpdate) {
          setUsers(data.users || []);
        }
      })
      .catch((err) => {
        if (shouldUpdate) {
          setLoadError(err.message || "Could not load users.");
        }
      })
      .finally(() => {
        if (shouldUpdate) {
          setIsLoading(false);
        }
      });

    return () => {
      shouldUpdate = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [user.employee_id, user.full_name, user.email, user.role].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [search, users]);

  const handleChange = (event) => {
    setFormError("");
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const openEditForm = (user) => {
    setForm({
      employee_id: user.employee_id,
      full_name: user.full_name || "",
      email: user.email || "",
      role: user.role || "",
      password: ""
    });
    setEditingUserId(user.employee_id);
    setFormError("");
    setShowForm(true);
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingUserId(null);
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUserId(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const saveUser = async () => {
    const normalizedForm = {
      employee_id: form.employee_id.trim(),
      email: form.email.trim(),
      role: form.role,
      password: form.password
    };

    if (!normalizedForm.employee_id || !normalizedForm.email || !normalizedForm.role) {
      setFormError("Employee ID, email, and role are required.");
      return;
    }

    if (!editingUserId && !normalizedForm.password) {
      setFormError("Password is required.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingUserId) {
        await updateUser(editingUserId, {
          email: normalizedForm.email,
          role: normalizedForm.role
        });
      } else {
        await createUser(normalizedForm);
      }

      await loadUsers();
      closeForm();
    } catch (err) {
      setFormError(err.message || "Could not save user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmDelete = window.confirm(`Delete credentials for ${user.email}?`);

    if (!confirmDelete) {
      return;
    }

    setActionError("");

    try {
      await deleteUser(user.employee_id);
      await loadUsers();
    } catch (err) {
      setActionError(err.message || "Could not delete user.");
    }
  };

  return (
    <div className="users-page">
      <div className="page-heading">
        <div>
          <p className="dashboard-kicker">Admin</p>
          <h1>Users</h1>
        </div>

        <button
          className="primary-action"
          type="button"
          onClick={openAddForm}
        >
          <AddRoundedIcon fontSize="small" />
          Add User
        </button>
      </div>

      <div className="users-toolbar">
        <label className="search-field">
          <SearchRoundedIcon fontSize="small" />
          <input
            type="search"
            placeholder="Search employee ID, name, email, or role"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      {actionError && <p className="form-error">{actionError}</p>}

      <div className="table-card">
        <table className="users-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td className="empty-table" colSpan="7">
                  Loading users...
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredUsers.map((user) => (
                <tr key={`${user.employee_id}-${user.email}`}>
                  <td>{user.employee_id}</td>
                  <td>{user.full_name || "-"}</td>
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
                        onClick={() => openEditForm(user)}
                        aria-label={`Edit ${user.email}`}
                        title="Edit"
                      >
                        <EditRoundedIcon fontSize="small" />
                      </button>

                      <button
                        className="icon-action delete-action"
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        aria-label={`Delete ${user.email}`}
                        title="Delete credentials"
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!isLoading && loadError && (
              <tr>
                <td className="empty-table error-text" colSpan="7">
                  {loadError}
                </td>
              </tr>
            )}

            {!isLoading && !loadError && filteredUsers.length === 0 && (
              <tr>
                <td className="empty-table" colSpan="7">
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
            <h2>{editingUserId ? "Edit User" : "Add User"}</h2>

            <label>
              Employee ID
              <input
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
                disabled={Boolean(editingUserId)}
              />
            </label>

            {editingUserId && (
              <label>
                Full Name
                <input name="full_name" value={form.full_name} disabled />
              </label>
            )}

            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={handleChange} />
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

            {!editingUserId && (
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </label>
            )}

            {formError && <p className="form-error">{formError}</p>}

            <div className="modal-actions">
              <button className="secondary-action" type="button" onClick={closeForm}>
                Cancel
              </button>
              <button
                className="primary-action"
                type="button"
                onClick={saveUser}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : editingUserId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
