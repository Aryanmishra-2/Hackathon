import { useEffect, useState } from "react";

import {
  createUser,
  updateUser,
  getManagers,
} from "../../api/user.api";

export default function CreateUserModal({
  open,
  onClose,
  onSuccess,
  editUser,
}) {

  const [form, setForm] = useState({

    name: "",

    email: "",

    password: "",

    role: "EMPLOYEE",

    department: "",

    designation: "",

    managerId: "",

    inviteToJira: false, // Jira invitation checkbox

  });

  const [managers, setManagers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showJiraOption, setShowJiraOption] = useState(false); // Show Jira checkbox

  const isEditMode = Boolean(editUser);

  useEffect(() => {

    if (!open) return;

    loadManagers();

    // Pre-fill form if editing
    if (editUser) {
      setForm({
        name: editUser.name || "",
        email: editUser.email || "",
        password: "", // Don't pre-fill password
        role: editUser.role || "EMPLOYEE",
        department: editUser.department || "",
        designation: editUser.designation || "",
        managerId: editUser.managerId || "",
        inviteToJira: false, // Reset Jira invitation
      });

      // Show Jira option only if user doesn't have Jira account yet
      // If jiraAccountId exists, user is already connected to Jira
      setShowJiraOption(!editUser.jiraAccountId);
    } else {
      // Reset form for create mode
      setForm({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
        department: "",
        designation: "",
        managerId: "",
        inviteToJira: false,
      });
      setShowJiraOption(true);
    }

  }, [open, editUser]);

  const loadManagers = async () => {

    try {

      const data = await getManagers();

      setManagers(data);

    } catch (err) {

      console.error(err);

    }

  };

  if (!open) return null;

  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]: e.target.value,

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      if (isEditMode) {
        // Update existing user
        const updatePayload = {
          name: form.name,
          email: form.email,
          role: form.role,
          department: form.department,
          designation: form.designation,
          managerId: form.managerId || null,
          inviteToJira: form.inviteToJira, // Include Jira invitation for edit
        };

        await updateUser(editUser.id, updatePayload);
        
        if (form.inviteToJira) {
          alert("User Updated Successfully! Jira invitation sent if user doesn't have Jira account.");
        } else {
          alert("User Updated Successfully");
        }
      } else {
        // Create new user
        await createUser(form);
        alert("User Created Successfully");
      }

      onSuccess();

      onClose();

      setForm({

        name: "",

        email: "",

        password: "",

        role: "EMPLOYEE",

        department: "",

        designation: "",

        managerId: "",

        inviteToJira: false,

      });

    } catch (err) {

      console.error(err);

      alert(

        err.response?.data?.message ||

        (isEditMode ? "Failed to update user." : "Failed to create user.")

      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >

      <div
        style={{
          width: "650px",
          background: "#fff",
          borderRadius: "14px",
          padding: "30px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >

        <h2>{isEditMode ? "Edit User" : "Create User"}</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "15px",
            }}
          />

          <br /><br />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "15px",
            }}
          />

          <br /><br />

          {!isEditMode && (
            <>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "15px",
                }}
              />

              <br /><br />
            </>
          )}

          <input
            type="text"
            name="department"
            placeholder="Department (e.g., Engineering, HR)"
            value={form.department}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "15px",
            }}
          />

          <br /><br />

          <input
            type="text"
            name="designation"
            placeholder="Designation (e.g., Software Engineer, HR Manager)"
            value={form.designation}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "15px",
            }}
          />

          <br /><br />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "15px",
            }}
          >

            <option value="EMPLOYEE">
              Employee
            </option>

            <option value="MANAGER">
              Manager
            </option>

            <option value="HR">
              HR
            </option>

          </select>

          <br /><br />

          {form.role === "EMPLOYEE" && (

            <select
              name="managerId"
              value={form.managerId}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "15px",
              }}
            >

              <option value="">
                Select Manager (Optional)
              </option>

              {managers.map((manager) => (

                <option
                  key={manager.id}
                  value={manager.id}
                >

                  {manager.name}

                </option>

              ))}

            </select>

          )}

          <br /><br />

          {/* Show Jira Status for existing users */}
          {isEditMode && editUser?.jiraAccountId && (
            <div
              style={{
                background: "#f0fdf4",
                border: "2px solid #16a34a",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "20px" }}>✓</span>
                <div>
                  <div style={{ color: "#15803d", fontWeight: "600", fontSize: "15px" }}>
                    Jira Account Connected
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                    This user is already connected to Jira workspace. Account ID: {editUser.jiraAccountId.substring(0, 20)}...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jira Invitation Checkbox - Show in both create and edit mode */}
          {showJiraOption && (
            <div
              style={{
                background: "#eff6ff",
                border: "2px solid #2563eb",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "500",
                }}
              >
                <input
                  type="checkbox"
                  name="inviteToJira"
                  checked={form.inviteToJira}
                  onChange={(e) =>
                    setForm({ ...form, inviteToJira: e.target.checked })
                  }
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                  }}
                />
                <div>
                  <div style={{ color: "#1e40af", fontWeight: "600" }}>
                    🔗 {isEditMode ? "Send Jira Workspace Invitation" : "Invite to Company Jira Workspace"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                    {isEditMode 
                      ? "Send Jira workspace invitation to this user. If they already have a Jira account, it will be linked automatically."
                      : "Send official Jira workspace invitation to employee's email. They'll be able to work on synced tasks in Jira."
                    }
                  </div>
                </div>
              </label>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#e5e7eb",
                color: "#374151",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "600",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#9ca3af" : "#2563eb",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: "600",
              }}
            >

              {

                loading

                  ? (isEditMode ? "Updating..." : "Creating...")

                  : (isEditMode ? "Update User" : "Create User")

              }

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}