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

      {/* Expanded Section with Discussion */}
      {expanded && (
        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "2px solid #e5e7eb" }}>
          <Discussion goalId={goal.id} />
        </div>
      )}

    </div>

  );

}