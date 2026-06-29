import {
  FaBullseye,
  FaCheckCircle,
  FaClock,
  FaChartLine,
} from "react-icons/fa";

import "./DashboardStats.css";

export default function DashboardStats({ statistics }) {

  const stats = [

    {
      title: "Total Goals",
      value: statistics?.totalGoals || 0,
      icon: <FaBullseye />,
      color: "#2563eb",
    },

    {
      title: "Completed",
      value: statistics?.completedGoals || 0,
      icon: <FaCheckCircle />,
      color: "#16a34a",
    },

    {
      title: "Pending",
      value: statistics?.pendingGoals || 0,
      icon: <FaClock />,
      color: "#f59e0b",
    },

    {
      title: "Performance",
      value: `${statistics?.averageProgress || 0}%`,
      icon: <FaChartLine />,
      color: "#9333ea",
    },

  ];

  return (

    <div className="stats-grid">

      {stats.map((item) => (

        <div
          key={item.title}
          className="stat-card"
        >

          <div
            className="stat-icon"
            style={{
              background: item.color,
            }}
          >
            {item.icon}
          </div>

          <div className="stat-content">

            <p>{item.title}</p>

            <h2>{item.value}</h2>

          </div>

        </div>

      ))}

    </div>

  );

}