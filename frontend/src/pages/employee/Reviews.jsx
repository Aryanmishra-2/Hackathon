import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import ReviewCard from "../../components/reviews/ReviewCard";

import { getEmployeeReviews } from "../../api/review.api";

export default function Reviews() {

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    let ignore = false;

    const loadReviews = async () => {

      try {

        const response = await getEmployeeReviews();

        if (!ignore) {

          setReviews(response.data);

        }

      } catch (err) {

        console.error(err);

        if (!ignore) {

          setError(

            err.response?.data?.message ||

            "Failed to load reviews."

          );

        }

      } finally {

        if (!ignore) {

          setLoading(false);

        }

      }

    };

    loadReviews();

    return () => {

      ignore = true;

    };

  }, []);

  return (

    <DashboardLayout>

      <h1
        style={{
          marginBottom: "30px",
        }}
      >
        My Reviews
      </h1>

      {loading && (

        <h2>Loading Reviews...</h2>

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
        reviews.length === 0 && (

          <h3>No Reviews Found.</h3>

        )}

      {!loading &&
        !error &&
        reviews.map((review) => (

          <ReviewCard

            key={review.id}

            review={review}

          />

        ))}

    </DashboardLayout>

  );

}