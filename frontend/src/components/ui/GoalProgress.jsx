import "./GoalProgress.css";

export default function GoalProgress({ goals = [] }) {

  if (goals.length === 0) {

    return (
      <div className="goal-progress">

        <div className="goal-header">
          <h2>Recent Goals</h2>
          <span>No Goals</span>
        </div>

        <p
          style={{
            padding: "25px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          No goals found.
        </p>

      </div>
    );

  }

  return (

    <div className="goal-progress">

      <div className="goal-header">

        <h2>Recent Goals</h2>

        <span>
          {goals.length} Goals
        </span>

      </div>

      {goals.map((goal) => (

        <div
          className="goal-item"
          key={goal.id}
        >

          <div className="goal-info">

            <div className="goal-title">

              {goal.title}

            </div>

            <div className="goal-status">

              {goal.status}

            </div>

          </div>

          <div className="progress-wrapper">

            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width: `${goal.progress}%`,
                }}
              ></div>

            </div>

            <span className="progress-text">

              {goal.progress}%

            </span>

          </div>

        </div>

      ))}

    </div>

  );

}