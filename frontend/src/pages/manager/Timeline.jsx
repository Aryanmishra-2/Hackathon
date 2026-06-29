import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getMyTimeline } from "../../api/timeline.api";

export default function Timeline() {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTimeline = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyTimeline();
      setTimeline(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load timeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, []);

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

  const getEventIcon = (title) => {
    const titleLower = title.toLowerCase();

    if (titleLower.includes("goal created")) return { icon: "🎯", color: "#2563eb" };
    if (titleLower.includes("goal updated")) return { icon: "✏️", color: "#f59e0b" };
    if (titleLower.includes("goal approved")) return { icon: "✅", color: "#16a34a" };
    if (titleLower.includes("goal rejected")) return { icon: "❌", color: "#dc2626" };
    if (titleLower.includes("goal deleted")) return { icon: "🗑️", color: "#dc2626" };
    if (titleLower.includes("goal completed")) return { icon: "🎉", color: "#8b5cf6" };
    if (titleLower.includes("progress")) return { icon: "📊", color: "#3b82f6" };
    if (titleLower.includes("feedback") || titleLower.includes("comment")) return { icon: "💬", color: "#ec4899" };
    if (titleLower.includes("review") || titleLower.includes("rating")) return { icon: "⭐", color: "#f59e0b" };
    if (titleLower.includes("discussion") || titleLower.includes("reply")) return { icon: "💭", color: "#06b6d4" };
    if (titleLower.includes("team") || titleLower.includes("manager")) return { icon: "👥", color: "#6366f1" };
    if (titleLower.includes("leave") || titleLower.includes("wfh")) return { icon: "🏖️", color: "#8b5cf6" };

    return { icon: "📅", color: "#6b7280" };
  };

  const groupByDate = (items) => {
    const groups = {};

    items.forEach((item) => {
      const date = new Date(item.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let label;

      if (date.toDateString() === today.toDateString()) {
        label = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = "Yesterday";
      } else if (diff < 7) {
        label = date.toLocaleDateString("en-US", { weekday: "long" });
      } else {
        label = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
        });
      }

      if (!groups[label]) {
        groups[label] = [];
      }

      groups[label].push(item);
    });

    return groups;
  };

  const groupedTimeline = timeline.length > 0 ? groupByDate(timeline) : {};

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ margin: "0 0 8px 0" }}>📅 Timeline</h1>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
          Your activity history and important events
        </p>
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
          <h3>Loading timeline...</h3>
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

      {!loading && !error && timeline.length === 0 && (
        <div
          style={{
            background: "#fff",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <h3>No timeline events yet</h3>
          <p style={{ color: "#6b7280", marginTop: "10px" }}>
            Your activity will appear here once you start working on goals.
          </p>
        </div>
      )}

      {!loading && !error && timeline.length > 0 && (
        <div>
          {Object.entries(groupedTimeline).map(([date, events]) => (
            <div key={date} style={{ marginBottom: "40px" }}>
              {/* Date Header */}
              <div
                style={{
                  position: "sticky",
                  top: "20px",
                  zIndex: 10,
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    background: "#f9fafb",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    display: "inline-block",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "#374151",
                    boxShadow: "0 1px 3px rgba(0,0,0,.1)",
                  }}
                >
                  {date}
                </div>
              </div>

              {/* Timeline Events */}
              <div style={{ position: "relative", paddingLeft: "40px" }}>
                {/* Vertical Line */}
                <div
                  style={{
                    position: "absolute",
                    left: "16px",
                    top: "0",
                    bottom: "0",
                    width: "2px",
                    background: "linear-gradient(to bottom, #e5e7eb 0%, #e5e7eb 100%)",
                  }}
                />

                {events.map((event, index) => {
                  const eventStyle = getEventIcon(event.title);

                  return (
                    <div
                      key={event.id}
                      style={{
                        position: "relative",
                        marginBottom: index === events.length - 1 ? "0" : "20px",
                      }}
                    >
                      {/* Icon Circle */}
                      <div
                        style={{
                          position: "absolute",
                          left: "-32px",
                          top: "8px",
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "#fff",
                          border: `3px solid ${eventStyle.color}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          boxShadow: "0 2px 4px rgba(0,0,0,.1)",
                        }}
                      >
                        {eventStyle.icon}
                      </div>

                      {/* Event Card */}
                      <div
                        style={{
                          background: "#fff",
                          borderRadius: "12px",
                          padding: "16px 20px",
                          boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                          border: "1px solid #e5e7eb",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.12)";
                          e.currentTarget.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.08)";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <h3
                              style={{
                                margin: "0 0 8px 0",
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#111827",
                              }}
                            >
                              {event.title}
                            </h3>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "14px",
                                lineHeight: "1.6",
                                color: "#6b7280",
                              }}
                            >
                              {event.description}
                            </p>
                          </div>

                          <div
                            style={{
                              fontSize: "12px",
                              color: "#9ca3af",
                              fontWeight: "500",
                              marginLeft: "16px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDate(event.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
