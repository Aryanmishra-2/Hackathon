import { useState } from "react";

import ApproveRejectModal from "./ApproveRejectModal";
import Discussion from "./Discussion";
import { deleteGoal } from "../../api/manager.api";

export default function ManagerGoalCard({
  goal,
  refresh,
}) {

  const [action, setAction] = useState("");

  const [open, setOpen] = useState(false);

  const [expanded, setExpanded] = useState(false);

  const handleAction = (type) => {

    setAction(type);

    setOpen(true);

  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the goal "${goal.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteGoal(goal.id);
      alert("Goal deleted successfully.");
      refresh();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        "Failed to delete goal."
      );
    }
  };

  const getStatusColor = (status) => {

    switch (status) {

      case "PENDING":
        return "#f59e0b";

      case "APPROVED":
        return "#16a34a";

      case "REJECTED":
        return "#dc2626";

      case "COMPLETED":
        return "#8b5cf6";

      default:
        return "#6b7280";

    }

  };

  const getProgressColor = (progress) => {

    if (progress >= 80) return "#16a34a";
    if (progress >= 50) return "#f59e0b";
    return "#dc2626";

  };

  const formatDate = (dateString) => {

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  };

  return (

    <>

      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          border: "1px solid #e5e7eb",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
          }}
        >

          <div style={{ flex: 1 }}>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>

              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
                {goal.title}
              </h2>

              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  background: getStatusColor(goal.status) + "20",
                  color: getStatusColor(goal.status),
                }}
              >
                {goal.status}
              </span>

            </div>

            <p style={{ color: "#6b7280", margin: "0 0 12px 0" }}>
              {goal.description}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                marginTop: "16px",
              }}
            >

              <div>
                <strong style={{ fontSize: "13px", color: "#6b7280" }}>Employee:</strong>
                <p style={{ margin: "4px 0 0 0", fontSize: "15px", fontWeight: "500" }}>
                  {goal.owner?.name || "—"}
                </p>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#9ca3af" }}>
                  {goal.owner?.designation || goal.owner?.department || ""}
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "13px", color: "#6b7280" }}>Progress:</strong>
                <div style={{ marginTop: "4px" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "#e5e7eb",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${goal.progress}%`,
                        height: "100%",
                        background: getProgressColor(goal.progress),
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: getProgressColor(goal.progress) }}>
                    {goal.progress}%
                  </span>
                </div>
              </div>

              <div>
                <strong style={{ fontSize: "13px", color: "#6b7280" }}>Timeline:</strong>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
                  {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
                </p>
              </div>

              {goal.feedbacks && goal.feedbacks.length > 0 && (

                <div>
                  <strong style={{ fontSize: "13px", color: "#6b7280" }}>Last Feedback:</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#374151" }}>
                    {goal.feedbacks[0]?.comment?.substring(0, 50)}
                    {goal.feedbacks[0]?.comment?.length > 50 ? "..." : ""}
                  </p>
                </div>

              )}

            </div>

          </div>

          <div style={{ display: "flex", gap: "8px", marginLeft: "20px", flexDirection: "column" }}>

            {/* Jira Integration Info */}
            {goal.jiraIssueKey && (
              <div
                style={{
                  padding: "12px",
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#0369a1", marginBottom: "6px" }}>
                  🔗 {goal.jiraIssueKey}
                </div>
                {goal.jiraStatus && (
                  <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>
                    {goal.jiraStatus}
                  </div>
                )}
                <a
                  href={goal.jiraIssueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#0284c7",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontSize: "12px",
                    fontWeight: "600",
                    display: "inline-block",
                  }}
                >
                  Open in Jira →
                </a>
              </div>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: expanded ? "#2563eb" : "#fff",
                color: expanded ? "#fff" : "#2563eb",
                border: "2px solid #2563eb",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.2s",
                marginBottom: "10px",
              }}
            >
              {expanded ? "▲ Hide Discussion" : "💬 View Discussion"}
            </button>

            {goal.status === "PENDING" && (

              <>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => handleAction("approve")}
                    style={{
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#15803d")}
                    onMouseOut={(e) => (e.target.style.background = "#16a34a")}
                  >
                    ✓ Approve
                  </button>

                  <button
                    onClick={() => handleAction("reject")}
                    style={{
                      background: "#dc2626",
                      color: "#fff",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#b91c1c")}
                    onMouseOut={(e) => (e.target.style.background = "#dc2626")}
                  >
                    ✗ Reject
                  </button>
                </div>
              </>

            )}

            {goal.status === "APPROVED" && (

              <span
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "#f0fdf4",
                  color: "#16a34a",
                  fontWeight: "600",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                ✓ Already Approved
              </span>

            )}

            {goal.status === "REJECTED" && (

              <span
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "#fef2f2",
                  color: "#dc2626",
                  fontWeight: "600",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                ✗ Rejected
              </span>

            )}

            {goal.status === "COMPLETED" && (

              <span
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "#f5f3ff",
                  color: "#8b5cf6",
                  fontWeight: "600",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                ★ Completed
              </span>

            )}

            <button
              onClick={handleDelete}
              style={{
                background: "#fff",
                color: "#dc2626",
                border: "2px solid #dc2626",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#dc2626";
                e.target.style.color = "#fff";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#fff";
                e.target.style.color = "#dc2626";
              }}
            >
              🗑️ Delete Goal
            </button>

          </div>

        </div>

        {/* Expanded Section with Discussion */}
        {expanded && (
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "2px solid #e5e7eb" }}>
            <Discussion goalId={goal.id} />
          </div>
        )}

      </div>

      <ApproveRejectModal

        open={open}

        action={action}

        goal={goal}

        onClose={() => setOpen(false)}

        onSuccess={refresh}

      />

    </>

  );

}
