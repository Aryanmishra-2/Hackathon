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

  });

  const [managers, setManagers] = useState([]);

  const [loading, setLoading] = useState(false);

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
      });
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
      });
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
        };

        await updateUser(editUser.id, updatePayload);
        alert("User Updated Successfully");
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