import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import GoalCard from "../../components/goals/GoalCard";
import CreateGoalModal from "../../components/goals/CreateGoalModal";

import { getGoals } from "../../api/goal.api";

export default function Goals() {

  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [openModal, setOpenModal] = useState(false);

  const loadGoals = async () => {

    try {

      setLoading(true);

      setError("");

      const data = await getGoals();

      setGoals(data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load goals."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadGoals();

  }, []);

  return (

    <DashboardLayout>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >

        <h1>My Goals</h1>

        <button
          onClick={() => setOpenModal(true)}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          + Create Goal
        </button>

      </div>

      {loading && (

        <h3>Loading Goals...</h3>

      )}

      {error && (

        <h3
          style={{
            color: "red",
          }}
        >
          {error}
        </h3>

      )}

      {!loading &&
        !error &&
        goals.length === 0 && (

          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "12px",
            }}
          >

            <h3>No Goals Found</h3>

            <p>
              Click on "Create Goal" to add your first goal.
            </p>

          </div>

        )}

      {!loading &&
        !error &&
        goals.map((goal) => (

          <GoalCard
            key={goal.id}
            goal={goal}
          />

        ))}

      <CreateGoalModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={loadGoals}
      />

    </DashboardLayout>

  );

}