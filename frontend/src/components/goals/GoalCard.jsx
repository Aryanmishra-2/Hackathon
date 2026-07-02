import { useState } from "react";
import "./GoalCard.css";
import Discussion from "./Discussion";

export default function GoalCard({ goal }) {

  const [expanded, setExpanded] = useState(false);

  return (

    <div className="goal-card">

      <div className="goal-header">

        <h2>{goal.title}</h2>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>

          <span
            className={`goal-status ${goal.status.toLowerCase()}`}
          >
            {goal.status}
          </span>

          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: expanded ? "#2563eb" : "#fff",
              color: expanded ? "#fff" : "#2563eb",
              border: "2px solid #2563eb",
              padding: "6px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              transition: "all 0.2s",
            }}
          >
            {expanded ? "▲ Hide Details" : "▼ View Details"}
          </button>

        </div>

      </div>

      <p className="goal-description">
        {goal.description}
      </p>

      <div className="goal-progress">

        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{
              width: `${goal.progress}%`,
            }}
          />

        </div>

        <span>
          {goal.progress}%
        </span>

      </div>

      <div className="goal-footer">

        <small>
          Start :
          {" "}
          {new Date(goal.startDate).toLocaleDateString()}
        </small>

        <small>
          End :
          {" "}
          {new Date(goal.endDate).toLocaleDateString()}
        </small>

      </div>

      {/* Jira Integration Info */}
      {goal.jiraIssueKey && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>🔗</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#0369a1" }}>
                Jira Task: {goal.jiraIssueKey}
              </div>
              {goal.jiraStatus && (
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                  Status: {goal.jiraStatus}
                </div>
              )}
            </div>
          </div>
          <a
            href={goal.jiraIssueUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#0284c7",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "600",
              display: "inline-block",
            }}
          >
            Open in Jira →
          </a>
        </div>
      )}

      {/* Expanded Section with Discussion */}
      {expanded && (
        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "2px solid #e5e7eb" }}>
          <Discussion goalId={goal.id} />
        </div>
      )}

    </div>

  );

}