import "./ProgressCard.css";

export default function ProgressCard({ goal }) {

  const getColor = () => {

    switch (goal.status) {

      case "COMPLETED":
        return "#16a34a";

      case "APPROVED":
        return "#2563eb";

      case "PENDING":
        return "#f59e0b";

      case "REJECTED":
        return "#dc2626";

      default:
        return "#6b7280";

    }

  };

  return (

    <div className="progress-card">

      <div className="progress-header">

        <div>

          <h2>{goal.title}</h2>

          <p>{goal.description}</p>

        </div>

        <span
          className="status-badge"
          style={{
            background: getColor(),
          }}
        >
          {goal.status}
        </span>

      </div>

      <div className="progress-bar">

        <div
          className="progress-fill"
          style={{
            width: `${goal.progress}%`,
          }}
        />

      </div>

      <div className="progress-footer">

        <span>{goal.progress}% Completed</span>

        <span>

          {new Date(goal.startDate).toLocaleDateString()}

          {" - "}

          {new Date(goal.endDate).toLocaleDateString()}

        </span>

      </div>

    </div>

  );

}