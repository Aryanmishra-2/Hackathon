import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import { createGoal } from "../../api/goal.api";

import { getTeam } from "../../api/manager.api";

import api from "../../api/api";

export default function CreateGoalModal({
  open,
  onClose,
  onSuccess,
}) {

  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    ownerId: "",
    startDate: "",
    endDate: "",
  });

  const [team, setTeam] = useState([]);

  const [loading, setLoading] = useState(false);

  // Load team members when manager opens modal
  useEffect(() => {

    if (!open || user?.role !== "MANAGER") return;

    getTeam()
      .then((data) => setTeam(data || []))
      .catch((err) => console.error("Failed to load team:", err));

  }, [open, user?.role]);

  if (!open) return null;

  const handleChange = (e) => {

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  };

  const resetForm = () => {

    setForm({
      title: "",
      description: "",
      ownerId: "",
      startDate: "",
      endDate: "",
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const payload = {
        title: form.title,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
      };

      // Manager must select an employee from their team
      if (user.role === "MANAGER") {
        if (!form.ownerId) {
          alert("Please select a team member.");
          setLoading(false);
          return;
        }
        payload.ownerId = form.ownerId;

        // Manager creates goal via /manager/goals endpoint
        await api.post("/manager/goals", payload);
      } else {
        // Employee creates their own goal
        await createGoal(payload);
      }

      alert("Goal Created Successfully.");

      resetForm();

      onSuccess();

      onClose();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to create goal."
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
        background: "rgba(0,0,0,.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >

      <div
        style={{
          width: "600px",
          background: "#fff",
          borderRadius: "12px",
          padding: "30px",
        }}
      >

        <h2>
          {user.role === "MANAGER" ? "Assign Goal to Team Member" : "Create Goal"}
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="title"
            placeholder="Goal Title"
            value={form.title}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
          />

          <textarea
            rows="4"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
          />

          {user.role === "MANAGER" && (

            <>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#111827" }}>
                Assign to Team Member *
              </label>

              <select
                name="ownerId"
                value={form.ownerId}
                onChange={handleChange}
                required
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  marginBottom: "15px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                }}
              >
                <option value="">-- Select Team Member --</option>
                {team.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} — {member.designation || member.department || member.email}
                  </option>
                ))}
              </select>
            </>

          )}

          <label style={{ display: "block", marginBottom: "5px", color: "#6b7280", fontSize: "13px" }}>
            Start Date
          </label>

          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
          />

          <label style={{ display: "block", marginBottom: "5px", color: "#6b7280", fontSize: "13px" }}>
            End Date
          </label>

          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "10px",
            }}
          >

            <button
              type="button"
              onClick={onClose}
              style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #ddd", cursor: "pointer" }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{ 
                padding: "12px 24px", 
                borderRadius: "8px", 
                background: loading ? "#9ca3af" : "#2563eb", 
                color: "#fff", 
                border: "none", 
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
              }}
            >
              {loading ? "Creating..." : user.role === "MANAGER" ? "Assign Goal" : "Create Goal"}
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}
