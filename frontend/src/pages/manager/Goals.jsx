import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import ManagerGoalCard from "../../components/goals/ManagerGoalCard";
import CreateGoalModal from "../../components/goals/CreateGoalModal";

import { getGoals } from "../../api/manager.api";

export default function Goals() {

  const [goals, setGoals] = useState([]);

  const [filteredGoals, setFilteredGoals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const loadGoals = async () => {

    try {

      setLoading(true);

      setError("");

      const data = await getGoals();

      setGoals(data);

      setFilteredGoals(data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load team goals."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadGoals();

  }, []);

  useEffect(() => {

    if (filter === "ALL") {
      setFilteredGoals(goals);
    } else {
      setFilteredGoals(goals.filter((goal) => goal.status === filter));
    }

  }, [filter, goals]);

  const stats = {
    total: goals.length,
    pending: goals.filter((g) => g.status === "PENDING").length,
    approved: goals.filter((g) => g.status === "APPROVED").length,
    rejected: goals.filter((g) => g.status === "REJECTED").length,
    completed: goals.filter((g) => g.status === "COMPLETED").length,
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

        <h1>Team Goals</h1>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>

          <button
            onClick={() => setOpenCreateModal(true)}
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
            + Create Goal
          </button>

          <button
            onClick={() => setFilter("ALL")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: filter === "ALL" ? "2px solid #2563eb" : "1px solid #ddd",
              background: filter === "ALL" ? "#eff6ff" : "#fff",
              cursor: "pointer",
            }}
          >
            All ({stats.total})
          </button>

          <button
            onClick={() => setFilter("PENDING")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: filter === "PENDING" ? "2px solid #f59e0b" : "1px solid #ddd",
              background: filter === "PENDING" ? "#fffbeb" : "#fff",
              cursor: "pointer",
            }}
          >
            Pending ({stats.pending})
          </button>

          <button
            onClick={() => setFilter("APPROVED")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: filter === "APPROVED" ? "2px solid #16a34a" : "1px solid #ddd",
              background: filter === "APPROVED" ? "#f0fdf4" : "#fff",
              cursor: "pointer",
            }}
          >
            Approved ({stats.approved})
          </button>

          <button
            onClick={() => setFilter("REJECTED")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: filter === "REJECTED" ? "2px solid #dc2626" : "1px solid #ddd",
              background: filter === "REJECTED" ? "#fef2f2" : "#fff",
              cursor: "pointer",
            }}
          >
            Rejected ({stats.rejected})
          </button>

        </div>

      </div>

      {loading && (

        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <h3>Loading team goals...</h3>
        </div>

      )}

      {error && (

        <div
          style={{
            background: "#fee",
            padding: "20px",
            borderRadius: "12px",
            color: "#dc2626",
          }}
        >
          <h3>{error}</h3>
        </div>

      )}

      {!loading && !error && filteredGoals.length === 0 && (

        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <h3>
            {filter === "ALL"
              ? "No team goals found."
              : `No ${filter.toLowerCase()} goals.`}
          </h3>
          <p style={{ color: "#6b7280", marginTop: "10px" }}>
            Team members haven't created any goals yet.
          </p>
        </div>

      )}

      {!loading &&
        !error &&
        filteredGoals.map((goal) => (

          <ManagerGoalCard
            key={goal.id}
            goal={goal}
            refresh={loadGoals}
          />

        ))}

      <CreateGoalModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={loadGoals}
      />

    </DashboardLayout>

  );

}
