import "./ReviewCard.css";

export default function ReviewCard({ review }) {

  const getStatusColor = (status) => {

    switch (status) {

      case "COMPLETED":
        return "#16a34a";

      case "PENDING":
        return "#f59e0b";

      default:
        return "#6b7280";

    }

  };

  const renderStars = (rating = 0) => {

    if (!rating) {

      return "Not Rated";

    }

    return "⭐".repeat(rating);

  };

  const getMonthName = (month) => {
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    return months[month - 1] || "Unknown";
  };

  const getReviewPeriodLabel = () => {
    if (review.reviewCycle === "MONTHLY" && review.reviewMonth) {
      return `${getMonthName(review.reviewMonth)} ${review.reviewYear}`;
    } else if (review.reviewCycle === "YEARLY") {
      return `Year ${review.reviewYear}`;
    }
    return new Date(review.createdAt).toLocaleDateString();
  };

  return (

    <div className="review-card">

      <div className="review-header">

        <div>

          <h2>

            Performance Review

          </h2>

          <span
            className="review-status"
            style={{
              background: getStatusColor(review.status),
            }}
          >

            {review.status}

          </span>

        </div>

        <div className="review-rating">

          {renderStars(review.rating)}

        </div>

      </div>

      <div className="review-body">

        <p>

          <strong>Employee :</strong>{" "}

          {review.user?.name || "-"}

        </p>

        <p>

          <strong>Department :</strong>{" "}

          {review.user?.department || "-"}

        </p>

        <p>

          <strong>Designation :</strong>{" "}

          {review.user?.designation || "-"}

        </p>

        <p style={{ color: "#2563eb", fontWeight: "600" }}>

          <strong>Review Period :</strong>{" "}
          📅 {getReviewPeriodLabel()}

        </p>

        <p>

          <strong>Feedback :</strong>{" "}

          {review.feedback || "No feedback available."}

        </p>

      </div>

      <div className="review-footer">

        <span>

          Submitted on :{" "}

          {

            review.createdAt

              ? new Date(
                  review.createdAt
                ).toLocaleDateString()

              : "-"

          }

        </span>

      </div>

    </div>

  );

}