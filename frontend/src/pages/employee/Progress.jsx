import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import ProgressCard from "../../components/progress/ProgressCard";
import UpdateProgressModal from "../../components/progress/UpdateProgressModal";

import { getMyProgress } from "../../api/progress.api";

export default function Progress() {

  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedGoal, setSelectedGoal] = useState(null);

  const [openModal, setOpenModal] = useState(false);

  const loadProgress = async () => {

    try {

      setLoading(true);

      setError("");

      const data = await getMyProgress();

      setGoals(data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load progress."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadProgress();

  }, []);

  const handleUpdate = (goal) => {

    setSelectedGoal(goal);

    setOpenModal(true);

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

        <h1>My Progress</h1>

      </div>

      {loading && (

        <h2>Loading Progress...</h2>

      )}

      {error && (

        <h2
          style={{
            color: "red",
          }}
        >
          {error}
        </h2>

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

            <h3>No Goals Available</h3>

          </div>

      )}

      {!loading &&
        !error &&
        goals.map((goal) => (

          <div
            key={goal.id}
            style={{
              marginBottom: "25px",
            }}
          >

            <ProgressCard

              goal={goal}

            />

            <button
              onClick={() => handleUpdate(goal)}
              style={{
                marginTop: "10px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Update Progress
            </button>

          </div>

        ))}

      <UpdateProgressModal

        open={openModal}

        goal={selectedGoal}

        onClose={() => {

          setOpenModal(false);

          setSelectedGoal(null);

        }}

        onSuccess={loadProgress}

      />

    </DashboardLayout>

  );

}