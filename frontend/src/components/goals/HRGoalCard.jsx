export default function HRGoalCard({ goal }) {

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

  // Check if goal was created by manager
  const isManagerCreated = goal.createdBy?.role === "MANAGER";

  return (

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

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>

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

            {/* Manager Created Badge */}
            {isManagerCreated && (
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "600",
                  background: "#dbeafe",
                  color: "#1e40af",
                  border: "1px solid #93c5fd",
                }}
              >
                👔 Manager Assigned
              </span>
            )}

          </div>

          <p style={{ color: "#6b7280", margin: "0 0 16px 0" }}>
            {goal.description}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >

            {/* Employee Info */}
            <div
              style={{
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <strong style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>
                Goal Owner:
              </strong>
              <p style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "600", color: "#111827" }}>
                {goal.owner?.name || "—"}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                {goal.owner?.designation || goal.owner?.department || ""}
              </p>
            </div>

            {/* Created By Info */}
            <div
              style={{
                padding: "12px",
                background: isManagerCreated ? "#eff6ff" : "#f9fafb",
                borderRadius: "8px",
                border: isManagerCreated ? "1px solid #bfdbfe" : "1px solid #e5e7eb",
              }}
            >
              <strong style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>
                Created By:
              </strong>
              <p style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "600", color: isManagerCreated ? "#1e40af" : "#111827" }}>
                {goal.createdBy?.name || "—"}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                {goal.createdBy?.role || ""}
              </p>
            </div>

            {/* Progress */}
            <div
              style={{
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <strong style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>
                Progress:
              </strong>
              <div style={{ marginTop: "8px" }}>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "#e5e7eb",
                    borderRadius: "4px",
                    overflow: "hidden",
                    marginBottom: "6px",
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
                <span style={{ fontSize: "14px", fontWeight: "700", color: getProgressColor(goal.progress) }}>
                  {goal.progress}%
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div
              style={{
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <strong style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px" }}>
                Timeline:
              </strong>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#374151" }}>
                {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
              </p>
            </div>

          </div>

          {/* Approved By */}
          {goal.approvedBy && (
            <div
              style={{
                marginTop: "12px",
                padding: "10px 14px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                display: "inline-block",
              }}
            >
              <span style={{ fontSize: "12px", color: "#15803d" }}>
                ✓ Approved by: <strong>{goal.approvedBy.name}</strong>
              </span>
            </div>
          )}

          {/* Feedbacks */}
          {goal.feedbacks && goal.feedbacks.length > 0 && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "8px",
              }}
            >
              <strong style={{ fontSize: "12px", color: "#92400e", display: "block", marginBottom: "6px" }}>
                Latest Feedback:
              </strong>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#78350f" }}>
                "{goal.feedbacks[0]?.comment?.substring(0, 100)}
                {goal.feedbacks[0]?.comment?.length > 100 ? "..." : ""}"
              </p>
              <span style={{ fontSize: "11px", color: "#a16207" }}>
                — {goal.feedbacks[0]?.manager?.name}
              </span>
            </div>
          )}

        </div>

      </div>

    </div>

  );

}
