import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getMyNotifications, markAsRead, markAllAsRead } from "../../api/notification.api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      await loadNotifications();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to mark as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await loadNotifications();
      alert("All notifications marked as read!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to mark all as read.");
    }
  };

  const filteredNotifications =
    filter === "ALL"
      ? notifications
      : filter === "UNREAD"
      ? notifications.filter((n) => !n.isRead)
      : notifications.filter((n) => n.isRead);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTypeColor = (type) => {
    switch (type) {
      case "GOAL":
        return { bg: "#dbeafe", color: "#1e40af", icon: "🎯" };
      case "REVIEW":
        return { bg: "#fef3c7", color: "#92400e", icon: "⭐" };
      case "TIMELINE":
        return { bg: "#fce7f3", color: "#9f1239", icon: "📅" };
      case "SYSTEM":
        return { bg: "#f3f4f6", color: "#374151", icon: "⚙️" };
      case "LEAVE":
        return { bg: "#ddd6fe", color: "#5b21b6", icon: "🏖️" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280", icon: "🔔" };
    }
  };

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
        <div>
          <h1 style={{ margin: "0 0 8px 0" }}>🔔 Notifications</h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            ✓ Mark All as Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setFilter("ALL")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: filter === "ALL" ? "2px solid #2563eb" : "1px solid #ddd",
            background: filter === "ALL" ? "#eff6ff" : "#fff",
            cursor: "pointer",
            fontWeight: filter === "ALL" ? "600" : "500",
            fontSize: "14px",
          }}
        >
          All ({notifications.length})
        </button>

        <button
          onClick={() => setFilter("UNREAD")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: filter === "UNREAD" ? "2px solid #f59e0b" : "1px solid #ddd",
            background: filter === "UNREAD" ? "#fffbeb" : "#fff",
            cursor: "pointer",
            fontWeight: filter === "UNREAD" ? "600" : "500",
            fontSize: "14px",
          }}
        >
          Unread ({unreadCount})
        </button>

        <button
          onClick={() => setFilter("READ")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: filter === "READ" ? "2px solid #16a34a" : "1px solid #ddd",
            background: filter === "READ" ? "#f0fdf4" : "#fff",
            cursor: "pointer",
            fontWeight: filter === "READ" ? "600" : "500",
            fontSize: "14px",
          }}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {loading && (
        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <h3>Loading notifications...</h3>
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#fef2f2",
            padding: "20px",
            borderRadius: "12px",
            color: "#dc2626",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <h3>{error}</h3>
        </div>
      )}

      {!loading && !error && filteredNotifications.length === 0 && (
        <div
          style={{
            background: "#fff",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <h3>
            {filter === "UNREAD"
              ? "No unread notifications"
              : filter === "READ"
              ? "No read notifications"
              : "No notifications yet"}
          </h3>
          <p style={{ color: "#6b7280", marginTop: "10px" }}>
            You're all up to date!
          </p>
        </div>
      )}

      {!loading && !error && filteredNotifications.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredNotifications.map((notification) => {
            const typeStyle = getTypeColor(notification.type);

            return (
              <div
                key={notification.id}
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                  border: notification.isRead ? "1px solid #e5e7eb" : "2px solid #2563eb",
                  position: "relative",
                  transition: "all 0.2s",
                }}
              >
                {!notification.isRead && (
                  <div
                    style={{
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "#2563eb",
                    }}
                  />
                )}

                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  {/* Icon */}
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: typeStyle.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      flexShrink: 0,
                    }}
                  >
                    {typeStyle.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: "16px",
                            fontWeight: "600",
                            color: notification.isRead ? "#6b7280" : "#111827",
                          }}
                        >
                          {notification.title}
                        </h3>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            background: typeStyle.bg,
                            color: typeStyle.color,
                          }}
                        >
                          {notification.type}
                        </span>
                      </div>

                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          style={{
                            background: "#eff6ff",
                            color: "#2563eb",
                            border: "1px solid #2563eb",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          ✓ Mark as Read
                        </button>
                      )}
                    </div>

                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "14px",
                        lineHeight: "1.6",
                        color: notification.isRead ? "#9ca3af" : "#374151",
                      }}
                    >
                      {notification.message}
                    </p>

                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "12px",
                        color: "#9ca3af",
                      }}
                    >
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
