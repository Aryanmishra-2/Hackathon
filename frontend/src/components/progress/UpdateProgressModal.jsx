import { useState } from "react";

import { updateGoalProgress } from "../../api/progress.api";

export default function UpdateProgressModal({
  open,
  goal,
  onClose,
  onSuccess,
}) {

  const [progress, setProgress] = useState(
    goal?.progress || 0
  );

  const [loading, setLoading] = useState(false);

  if (!open || !goal) return null;

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      await updateGoalProgress(
        goal.id,
        Number(progress)
      );

      alert("Progress Updated Successfully");

      onSuccess();

      onClose();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to update progress."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >

      <div
        style={{
          width: "500px",
          background: "#fff",
          borderRadius: "12px",
          padding: "30px",
        }}
      >

        <h2>Update Progress</h2>

        <form onSubmit={handleSubmit}>

          <label>

            Progress

          </label>

          <br /><br />

          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) =>
              setProgress(e.target.value)
            }
            style={{
              width: "100%",
            }}
          />

          <h2
            style={{
              textAlign: "center",
              marginTop: "15px",
            }}
          >
            {progress}%
          </h2>

          <br />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >

            <button
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Update"}
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}