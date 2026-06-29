import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import { getDashboard } from "../../api/dashboard.api";

export default function Analytics() {

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadAnalytics = async () => {

    try {

      setLoading(true);

      // getHRDashboard returns { success, data: { totalEmployees, ... , recentGoals } }
      const response = await getDashboard();

      setDashboard(response.data);

    } catch (err) {

      console.error(err);

      setError(

        err.response?.data?.message ||

        "Failed to load analytics."

      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadAnalytics();

  }, []);

  if (loading) {

    return (

      <DashboardLayout>

        <h2>Loading Analytics...</h2>

      </DashboardLayout>

    );

  }

  if (error) {

    return (

      <DashboardLayout>

        <h2
          style={{
            color: "red",
          }}
        >
          {error}
        </h2>

      </DashboardLayout>

    );

  }

  // hr.service.getDashboard returns flat stats (not nested under .statistics)
  const stats = dashboard;

  const completionRate = stats.totalGoals
    ? Math.round(
        (stats.completedGoals / stats.totalGoals) * 100
      )
    : 0;

  return (

    <DashboardLayout>

      <h1
        style={{
          marginBottom: "30px",
        }}
      >
        HR Analytics Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
          gap: "20px",
        }}
      >

        <div className="analytics-card">
          <h2>Total Employees</h2>
          <h1>{stats.totalEmployees}</h1>
        </div>

        <div className="analytics-card">
          <h2>Total Managers</h2>
          <h1>{stats.totalManagers}</h1>
        </div>

        <div className="analytics-card">
          <h2>Total Goals</h2>
          <h1>{stats.totalGoals}</h1>
        </div>

        <div className="analytics-card">
          <h2>Completed Goals</h2>
          <h1>{stats.completedGoals}</h1>
        </div>

        <div className="analytics-card">
          <h2>Pending Goals</h2>
          <h1>{stats.pendingGoals}</h1>
        </div>

        <div className="analytics-card">
          <h2>Rejected Goals</h2>
          <h1>{stats.rejectedGoals}</h1>
        </div>

        <div className="analytics-card">
          <h2>Completion Rate</h2>
          <h1>{completionRate}%</h1>
        </div>

        <div className="analytics-card">
          <h2>Average Progress</h2>
          <h1>{stats.averageProgress ?? 0}%</h1>
        </div>

      </div>

      <div
        style={{
          marginTop: "40px",
          background: "#fff",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 5px 15px rgba(0,0,0,.05)",
        }}
      >

        <h2>Goal Summary</h2>

        <p style={{ color: "#6b7280", marginTop: "10px" }}>
          Total Goals: {stats.totalGoals} &nbsp;|&nbsp;
          Pending: {stats.pendingGoals} &nbsp;|&nbsp;
          Approved: {stats.approvedGoals} &nbsp;|&nbsp;
          Rejected: {stats.rejectedGoals} &nbsp;|&nbsp;
          Completed: {stats.completedGoals}
        </p>

      </div>

    </DashboardLayout>

  );

}