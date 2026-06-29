import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import { getTeam } from "../../api/manager.api";

import api from "../../api/api";

export default function Reports() {

  const [team, setTeam] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [generating, setGenerating] = useState(null);

  useEffect(() => {

    loadTeam();

  }, []);

  const loadTeam = async () => {

    try {

      setLoading(true);

      const data = await getTeam();

      setTeam(data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load team members."
      );

    } finally {

      setLoading(false);

    }

  };

  const handleDownloadReport = async (employee) => {

    try {

      setGenerating(employee.id);

      // Call API to generate PDF
      const response = await api.get(
        `/reports/employee/${employee.id}/pdf`,
        {
          responseType: "blob", // Important for PDF download
        }
      );

      // Create blob from response
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create download link
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `Performance_Report_${employee.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

      document.body.appendChild(link);

      link.click();

      // Cleanup
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      alert("Report downloaded successfully!");

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to generate report. Make sure pdfkit is installed in backend."
      );

    } finally {

      setGenerating(null);

    }

  };

  return (

    <DashboardLayout>

      <div
        style={{
          marginBottom: "30px",
        }}
      >

        <h1 style={{ marginBottom: "10px" }}>Performance Reports</h1>

        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Download comprehensive performance reports for your team members
        </p>

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
          <h3>Loading team members...</h3>
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

      {!loading && !error && team.length === 0 && (

        <div
          style={{
            background: "#fff",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <h3>No Team Members Found</h3>
          <p style={{ color: "#6b7280", marginTop: "10px" }}>
            You need team members to generate reports.
          </p>
        </div>

      )}

      {!loading && !error && team.length > 0 && (

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >

          {team.map((employee) => (

            <div
              key={employee.id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                border: "1px solid #e5e7eb",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >

                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: "#2563eb",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: "700",
                    marginRight: "16px",
                  }}
                >
                  {employee.name.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>

                  <h3 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>
                    {employee.name}
                  </h3>

                  <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                    {employee.email}
                  </p>

                </div>

              </div>

              <div style={{ marginBottom: "16px" }}>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Department:
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>
                    {employee.department || "—"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Designation:
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>
                    {employee.designation || "—"}
                  </span>
                </div>

              </div>

              <button
                onClick={() => handleDownloadReport(employee)}
                disabled={generating === employee.id}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  background: generating === employee.id ? "#9ca3af" : "#2563eb",
                  color: "#fff",
                  border: "none",
                  cursor: generating === employee.id ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  if (generating !== employee.id) {
                    e.target.style.background = "#1d4ed8";
                  }
                }}
                onMouseOut={(e) => {
                  if (generating !== employee.id) {
                    e.target.style.background = "#2563eb";
                  }
                }}
              >
                {generating === employee.id
                  ? "Generating PDF..."
                  : "📄 Download Performance Report"}
              </button>

            </div>

          ))}

        </div>

      )}

      {/* Info Box */}

      <div
        style={{
          marginTop: "30px",
          background: "#eff6ff",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #bfdbfe",
        }}
      >

        <h3 style={{ margin: "0 0 10px 0", color: "#1e40af", fontSize: "16px" }}>
          📊 About Performance Reports
        </h3>

        <ul style={{ margin: 0, paddingLeft: "20px", color: "#1e3a8a" }}>

          <li style={{ marginBottom: "8px" }}>
            Includes complete employee information and manager details
          </li>

          <li style={{ marginBottom: "8px" }}>
            Shows all goals with status, progress, and feedback
          </li>

          <li style={{ marginBottom: "8px" }}>
            Displays performance reviews with ratings and feedback
          </li>

          <li style={{ marginBottom: "8px" }}>
            Lists recent activity timeline
          </li>

          <li style={{ marginBottom: "8px" }}>
            Calculates key metrics: completion rate, average progress, average rating
          </li>

        </ul>

      </div>

    </DashboardLayout>

  );

}
