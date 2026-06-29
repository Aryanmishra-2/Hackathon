import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createComment,
  getGoalComments,
  updateComment,
  deleteComment,
} from "../../api/discussion.api";

export default function Discussion({ goalId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editMessage, setEditMessage] = useState("");

  // Load comments
  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await getGoalComments(goalId);
      setComments(data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load discussion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (goalId) {
      loadComments();
    }
  }, [goalId]);

  // Submit new comment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      alert("Please enter a message.");
      return;
    }

    try {
      setSubmitting(true);
      await createComment(goalId, message.trim());
      setMessage("");
      await loadComments();
      alert("Comment posted successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Update comment
  const handleUpdate = async (commentId) => {
    if (!editMessage.trim()) {
      alert("Please enter a message.");
      return;
    }

    try {
      await updateComment(commentId, editMessage.trim());
      setEditingId(null);
      setEditMessage("");
      await loadComments();
      alert("Comment updated successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update comment.");
    }
  };

  // Delete comment
  const handleDelete = async (commentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    try {
      await deleteComment(commentId);
      await loadComments();
      alert("Comment deleted successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete comment.");
    }
  };

  // Start editing
  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditMessage(comment.message);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditMessage("");
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "EMPLOYEE":
        return { bg: "#dbeafe", color: "#1e40af" };
      case "MANAGER":
        return { bg: "#fef3c7", color: "#92400e" };
      case "HR":
        return { bg: "#fce7f3", color: "#9f1239" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "24px",
        marginTop: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
        border: "1px solid #e5e7eb",
      }}
    >
      <h3
        style={{
          margin: "0 0 20px 0",
          fontSize: "18px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        💬 Discussion
        <span
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "#6b7280",
          }}
        >
          ({comments.length})
        </span>
      </h3>

      {/* Comments List */}
      <div
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          marginBottom: "20px",
          padding: "10px",
          background: "#f9fafb",
          borderRadius: "8px",
        }}
      >
        {loading && (
          <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
            Loading discussion...
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
            No comments yet. Start the discussion!
          </div>
        )}

        {!loading &&
          comments.map((comment) => {
            const roleColors = getRoleBadgeColor(comment.user.role);
            const isOwner = comment.user.id === user.id;

            return (
              <div
                key={comment.id}
                style={{
                  background: "#fff",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  border: isOwner ? "2px solid #2563eb" : "1px solid #e5e7eb",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* User Avatar */}
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: roleColors.bg,
                        color: roleColors.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "14px",
                      }}
                    >
                      {comment.user.name.charAt(0).toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: "600", fontSize: "14px" }}>
                          {comment.user.name}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: roleColors.bg,
                            color: roleColors.color,
                          }}
                        >
                          {comment.user.role}
                        </span>
                        {isOwner && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "600",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              background: "#eff6ff",
                              color: "#2563eb",
                            }}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isOwner && editingId !== comment.id && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => startEdit(comment)}
                        style={{
                          background: "transparent",
                          border: "1px solid #d1d5db",
                          padding: "4px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        style={{
                          background: "transparent",
                          border: "1px solid #dc2626",
                          padding: "4px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#dc2626",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Message */}
                {editingId === comment.id ? (
                  <div style={{ marginTop: "12px" }}>
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      rows="3"
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "2px solid #2563eb",
                        borderRadius: "8px",
                        resize: "none",
                        fontFamily: "inherit",
                        fontSize: "14px",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginTop: "8px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={cancelEdit}
                        style={{
                          background: "#fff",
                          border: "1px solid #d1d5db",
                          padding: "6px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(comment.id)}
                        style={{
                          background: "#2563eb",
                          color: "#fff",
                          border: "none",
                          padding: "6px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      color: "#374151",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {comment.message}
                  </p>
                )}
              </div>
            );
          })}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your comment here..."
          rows="3"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "12px",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            resize: "none",
            fontFamily: "inherit",
            fontSize: "14px",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "12px",
          }}
        >
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            style={{
              background: submitting || !message.trim() ? "#9ca3af" : "#2563eb",
              color: "#fff",
              border: "none",
              padding: "10px 24px",
              borderRadius: "8px",
              cursor: submitting || !message.trim() ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => {
              if (!submitting && message.trim()) {
                e.target.style.background = "#1e40af";
              }
            }}
            onMouseOut={(e) => {
              if (!submitting && message.trim()) {
                e.target.style.background = "#2563eb";
              }
            }}
          >
            {submitting ? "Posting..." : "💬 Post Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}
