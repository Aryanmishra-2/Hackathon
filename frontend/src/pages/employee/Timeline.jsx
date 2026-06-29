import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import TimelineCard from "../../components/timeline/TimelineCard";

import { getMyTimeline } from "../../api/timeline.api";

export default function Timeline() {

  const [timeline, setTimeline] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    let ignore = false;

    const loadTimeline = async () => {

      try {

        const data = await getMyTimeline();

        if (!ignore) {

          setTimeline(data);

        }

      } catch (err) {

        console.error(err);

        if (!ignore) {

          setError(
            err.response?.data?.message ||
            "Failed to load timeline."
          );

        }

      } finally {

        if (!ignore) {

          setLoading(false);

        }

      }

    };

    loadTimeline();

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
        Timeline
      </h1>

      {loading && (

        <h2>Loading Timeline...</h2>

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
        timeline.length === 0 && (

          <h3>No Activities Found.</h3>

      )}

      {!loading &&
        !error &&
        timeline.map((item) => (

          <TimelineCard
            key={item.id}
            activity={item}
          />

        ))}

    </DashboardLayout>

  );

}