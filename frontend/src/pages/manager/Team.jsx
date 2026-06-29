import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import { getTeam } from "../../api/manager.api";

import api from "../../api/api";

export default function Team() {

  const [team, setTeam] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [ratingModal, setRatingModal] = useState(null);

  const [ratingForm, setRatingForm] = useState({
    rating: 3,
    feedback: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [removing, setRemoving] = useState(null);

  useEffect(() => {

    loadTeam();

  }, []);

  const loadTeam = async () => {

    try {

      setLoading(true);

      const data = await getTeam();

      setTeam(data);

    } catch (err) {

      console.error(err);

      setError(

        err.response?.data?.message ||

        "Failed to load team."

      );

    } finally {

      setLoading(false);

    }

  };

  const handleOpenRatingModal = (employee) => {

    setRatingModal(employee);

    setRatingForm({ rating: 3, feedback: "" });

  };

  const handleCloseRatingModal = () => {

    setRatingModal(null);

    setRatingForm({ rating: 3, feedback: "" });

  };

  const handleSubmitRating = async (e) => {

    e.preventDefault();

    try {

      setSubmitting(true);

      // Call new quick rating endpoint
      await api.post(`/manager/team/${ratingModal.id}/rating`, {
        rating: Number(ratingForm.rating),
        feedback: ratingForm.feedback,
      });

      alert(`Rating submitted successfully for ${ratingModal.name}!`);

      handleCloseRatingModal();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to submit rating."
      );

    } finally {

      setSubmitting(false);

    }

  };

  const handleRemoveFromTeam = async (employee) => {

    const confirmed = window.confirm(
      `Are you sure you want to remove ${employee.name} from your team?\n\n` +
      `This will unassign them from you. Their account and data will remain intact.\n\n` +
      `This action can be reversed by HR reassigning them to you.`
    );

    if (!confirmed) return;

    try {

      setRemoving(employee.id);

      await api.delete(`/manager/team/${employee.id}`);

      alert(`${employee.name} has been removed from your team successfully.`);

      // Refresh team list
      loadTeam();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to remove employee from team."
      );

    } finally {

      setRemoving(null);

    }

  };

  return (

    <DashboardLayout>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >

        <h1>My Team</h1>

        <div
          style={{
            background: "#eff6ff",
            padding: "12px 20px",
            borderRadius: "8px",
            border: "1px solid #bfdbfe",
          }}
        >
          <strong style={{ color: "#1e40af" }}>
            Total Members: {team.length}
          </strong>
        </div>

      </div>

      {loading && (

        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <h3>Loading team members...</h3>
        </div>

      )}

      {error && (

        <div
          style={{
            background: "#fee",
            padding: "20px",
            borderRadius: "12px",
            color: "#dc2626",
          }}
        >
          <h3>{error}</h3>
        </div>

      )}

      {

        !loading &&

        team.length === 0 && (

          <div
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <h3>No Team Members Found</h3>
            <p style={{ color: "#6b7280", marginTop: "10px" }}>
              You don't have any team members assigned yet.
            </p>
          </div>

        )

      }

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "20px",
        }}
      >

        {

          team.map((employee) => (

            <div

              key={employee.id}

              style={{

                background: "#fff",

                padding: "24px",

                borderRadius: "12px",

                boxShadow: "0 2px 8px rgba(0,0,0,.08)",

                border: "1px solid #e5e7eb",

                position: "relative",

              }}

            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >

                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "700",
                    marginRight: "16px",
                  }}
                >
                  {employee.name.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>

                  <h3 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>
                    {employee.name}
                  </h3>

                  <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                    {employee.email}
                  </p>

                </div>

              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Department:
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>
                    {employee.department || "—"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Designation:
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>
                    {employee.designation || "—"}
                  </span>
                </div>

              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                <button
                  onClick={() => handleOpenRatingModal(employee)}
                  disabled={removing === employee.id}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    background: removing === employee.id ? "#9ca3af" : "#2563eb",
                    color: "#fff",
                    border: "none",
                    cursor: removing === employee.id ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (removing !== employee.id) {
                      e.target.style.background = "#1d4ed8";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (removing !== employee.id) {
                      e.target.style.background = "#2563eb";
                    }
                  }}
                >
                  ⭐ Give Rating
                </button>

                <button
                  onClick={() => handleRemoveFromTeam(employee)}
                  disabled={removing === employee.id}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#fff",
                    color: removing === employee.id ? "#9ca3af" : "#dc2626",
                    border: `2px solid ${removing === employee.id ? "#9ca3af" : "#dc2626"}`,
                    cursor: removing === employee.id ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (removing !== employee.id) {
                      e.target.style.background = "#dc2626";
                      e.target.style.color = "#fff";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (removing !== employee.id) {
                      e.target.style.background = "#fff";
                      e.target.style.color = "#dc2626";
                    }
                  }}
                >
                  {removing === employee.id ? "⏳ Removing..." : "🚫 Remove from Team"}
                </button>

              </div>

            </div>

          ))

        }

      </div>

      {/* Rating Modal */}

      {ratingModal && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
          onClick={handleCloseRatingModal}
        >

          <div
            style={{
              background: "#fff",
              padding: "30px",
              width: "500px",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0,0,0,.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >

            <h2 style={{ marginBottom: "10px" }}>
              Give Rating to {ratingModal.name}
            </h2>

            <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "14px" }}>
              Rate this team member's overall performance
            </p>

            <form onSubmit={handleSubmitRating}>

              <label
                style={{
                  fontWeight: "600",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Rating (1-5 Stars) ⭐
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >

                {[1, 2, 3, 4, 5].map((star) => (

                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                    style={{
                      fontSize: "32px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.transform = "scale(1.2)")}
                    onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                  >
                    {star <= ratingForm.rating ? "⭐" : "☆"}
                  </button>

                ))}

                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#2563eb",
                    alignSelf: "center",
                    marginLeft: "10px",
                  }}
                >
                  {ratingForm.rating}/5
                </span>

              </div>

              <label
                style={{
                  fontWeight: "600",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Feedback (Optional)
              </label>

              <textarea
                rows="5"
                value={ratingForm.feedback}
                onChange={(e) => setRatingForm({ ...ratingForm, feedback: e.target.value })}
                placeholder="Write your feedback about this employee's performance..."
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  marginBottom: "20px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >

                <button
                  type="button"
                  onClick={handleCloseRatingModal}
                  disabled={submitting}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    cursor: submitting ? "not-allowed" : "pointer",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "8px",
                    background: submitting ? "#9ca3af" : "#2563eb",
                    color: "#fff",
                    border: "none",
                    cursor: submitting ? "not-allowed" : "pointer",
                    fontWeight: "600",
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Rating"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </DashboardLayout>

  );

}