import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import ReportCard from "../../components/reports/ReportCard";

import { getMyReports } from "../../api/report.api";

export default function Reports() {

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    let ignore = false;

    const loadReports = async () => {

      try {

        const data = await getMyReports();

        if (!ignore) {

          setReports(data);

        }

      } catch (err) {

        console.error(err);

        if (!ignore) {

          setError(
            err.response?.data?.message ||
            "Failed to load reports."
          );

        }

      } finally {

        if (!ignore) {

          setLoading(false);

        }

      }

    };

    loadReports();

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
        Performance Reports
      </h1>

      {loading && (

        <h2>Loading Reports...</h2>

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
        reports.length === 0 && (

          <h3>No Reports Available.</h3>

      )}

      {!loading &&
        !error &&
        reports.map((report) => (

          <ReportCard

            key={report.id}

            report={report}

          />

        ))}

    </DashboardLayout>

  );

}