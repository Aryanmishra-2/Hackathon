import {
  FaUserEdit,
  FaTrash,
  FaUserCircle,
  FaFileDownload,
  FaUndo,
} from "react-icons/fa";

import "./UserCard.css";

export default function UserCard({
  user,
  onEdit,
  onDelete,
  onRestore,
  onDownloadReport,
  isDownloading,
  isArchived = false,
}) {

  const getRoleColor = (role) => {

    switch (role) {

      case "HR":
        return "#9333ea";

      case "MANAGER":
        return "#2563eb";

      case "EMPLOYEE":
        return "#16a34a";

      default:
        return "#6b7280";

    }

  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (

    <div className="user-card" style={{ opacity: isArchived ? 0.85 : 1 }}>

      <div className="user-left">

        <div className="user-avatar" style={{ opacity: isArchived ? 0.6 : 1 }}>

          <FaUserCircle />

        </div>

        <div>

          <h2>
            {user.name}
            {isArchived && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#ef4444",
                  background: "#fee2e2",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  marginLeft: "10px",
                  fontWeight: "600",
                }}
              >
                Archived
              </span>
            )}
          </h2>

          <p>{user.email}</p>

          <span
            className="role-badge"
            style={{
              background: getRoleColor(user.role),
            }}
          >
            {user.role}
          </span>

        </div>

      </div>

      <div className="user-right">

        <div className="status">

          {isArchived ? (
            <>
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>
                📅 Archived: {formatDate(user.deletedAt)}
              </span>
              <span style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px", display: "block" }}>
                {user.department || "—"} • {user.designation || "No designation"}
              </span>
            </>
          ) : (
            <>
              <span className="role-badge" style={{ fontSize: "12px", color: "#6b7280" }}>
                {user.department || "—"}
              </span>

              <span style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px", display: "block" }}>
                {user.designation || "No designation"}
              </span>
            </>
          )}

        </div>

        <div className="actions">

          <button
            className="download-btn"
            onClick={() => onDownloadReport(user.id, user.name)}
            disabled={isDownloading}
            title="Download Performance Report"
            style={{
              background: isDownloading ? "#9ca3af" : "#10b981",
              color: "#fff",
              border: "none",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: isDownloading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
          >
            {isDownloading ? "⏳" : <FaFileDownload />}
            {isDownloading ? "Downloading..." : "Report"}
          </button>

          {!isArchived && onEdit && (
            <button
              className="edit-btn"
              onClick={() => onEdit(user)}
            >

              <FaUserEdit />

            </button>
          )}

          {!isArchived && onDelete && (
            <button
              className="delete-btn"
              onClick={() => onDelete(user.id)}
              title="Archive User"
            >

              <FaTrash />

            </button>
          )}

          {isArchived && onRestore && (
            <button
              className="restore-btn"
              onClick={() => onRestore(user.id)}
              title="Restore User"
              style={{
                background: "#10b981",
                color: "#fff",
                border: "none",
                padding: "10px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.2s",
              }}
            >
              <FaUndo />
              Restore
            </button>
          )}

        </div>

      </div>

    </div>

  );

}