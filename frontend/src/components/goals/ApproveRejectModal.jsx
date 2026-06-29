import { useState } from "react";

import {
  approveGoal,
  rejectGoal,
} from "../../api/manager.api";

export default function ApproveRejectModal({
  open,
  action,
  goal,
  onClose,
  onSuccess,
}) {

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);

  if (!open || !goal) return null;

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      if (action === "approve") {

        await approveGoal(
          goal.id,
          comment
        );

      } else {

        await rejectGoal(
          goal.id,
          comment
        );

      }

      alert(

        action === "approve"
          ? "Goal Approved Successfully"
          : "Goal Rejected Successfully"

      );

      onSuccess();

      onClose();

    } catch (err) {

      console.error(err);

      alert(

        err.response?.data?.message ||

        "Something went wrong."

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
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >

      <div
        style={{
          width: "550px",
          background: "#fff",
          borderRadius: "12px",
          padding: "30px",
        }}
      >

        <h2>

          {action === "approve"

            ? "Approve Goal"

            : "Reject Goal"}

        </h2>

        <form onSubmit={handleSubmit}>

          <label>

            Comment

          </label>

          <br /><br />

          <textarea

            rows="5"

            value={comment}

            onChange={(e) =>
              setComment(e.target.value)
            }

            placeholder="Write your feedback..."

            style={{
              width: "100%",
              padding: "12px",
              resize: "none",
            }}

          />

          <br /><br />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
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

                ? "Please Wait..."

                : action === "approve"

                  ? "Approve Goal"

                  : "Reject Goal"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}