import { FaDownload } from "react-icons/fa";

import { downloadReport } from "../../api/report.api";

import "./ReportCard.css";

export default function ReportCard({ report }) {

  const handleDownload = async () => {

    try {

      const file = await downloadReport(report.id);

      const url = window.URL.createObjectURL(file);

      const link = document.createElement("a");

      link.href = url;

      link.download = `${report.title}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {

      console.error(err);

      alert("Failed to download report.");

    }

  };

  const getPerformanceColor = () => {

    if (report.performance >= 90)
      return "#16a34a";

    if (report.performance >= 70)
      return "#2563eb";

    if (report.performance >= 50)
      return "#f59e0b";

    return "#dc2626";

  };

  return (

    <div className="report-card">

      <div className="report-header">

        <div>

          <h2>

            {report.title}

          </h2>

          <p>

            {report.period}

          </p>

        </div>

        <span
          className="rating"
        >

          ⭐ {report.rating || 0}

        </span>

      </div>

      <div className="performance">

        <div className="performance-bar">

          <div

            className="performance-fill"

            style={{
              width: `${report.performance || 0}%`,
              background: getPerformanceColor(),
            }}

          />

        </div>

        <span>

          {report.performance || 0}%

        </span>

      </div>

      <div className="report-footer">

        <button
          className="download-btn"
          onClick={handleDownload}
        >

          <FaDownload />

          Download

        </button>

      </div>

    </div>

  );

}