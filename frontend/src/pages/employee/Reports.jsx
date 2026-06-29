import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";

export default function Reports() {

  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = async () => {

    try {

      setDownloading(true);

      // Call the API to download the PDF
      const response = await api.get("/employee/report/download", {
        responseType: "blob",
      });

      // Create a blob from the response
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `My_Performance_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("Performance report downloaded successfully!");

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to download performance report."
      );

    } finally {

      setDownloading(false);

    }

  };

  return (
    <DashboardLayout>

      <h1 style={{ marginBottom: "20px" }}>Performance Reports</h1>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,.08)",
        }}
      >

        <h2 style={{ marginBottom: "10px", fontSize: "20px" }}>
          Download Your Performance Report
        </h2>

        <p style={{ color: "#6b7280", marginBottom: "25px", lineHeight: "1.6" }}>
          Generate and download a comprehensive PDF report of your performance including:
        </p>

        <ul style={{ color: "#6b7280", marginBottom: "25px", lineHeight: "1.8", paddingLeft: "25px" }}>
          <li>Employee Information</li>
          <li>Performance Summary & Statistics</li>
          <li>Goals and Progress Tracking</li>
          <li>Manager Reviews and Feedback</li>
          <li>AI-Generated Performance Review</li>
          <li>AI Rating and Analysis</li>
          <li>Identified Strengths</li>
          <li>Areas for Improvement</li>
          <li>Recommendations for Growth</li>
          <li>Timeline of Activities</li>
          <li>Review History</li>
        </ul>

        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          style={{
            background: downloading ? "#9ca3af" : "#2563eb",
            color: "#fff",
            border: "none",
            padding: "14px 28px",
            borderRadius: "8px",
            cursor: downloading ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            if (!downloading) e.target.style.background = "#1d4ed8";
          }}
          onMouseOut={(e) => {
            if (!downloading) e.target.style.background = "#2563eb";
          }}
        >
          {downloading ? (
            <>
              <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
              Generating Report...
            </>
          ) : (
            <>
              📄 Download Performance Report (PDF)
            </>
          )}
        </button>

      </div>

    </DashboardLayout>
  );
}