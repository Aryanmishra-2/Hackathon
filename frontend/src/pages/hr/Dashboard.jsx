import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardStats from "../../components/ui/DashboardStats";
import { useAuth } from "../../context/AuthContext";

import { getHRDashboard } from "../../api/dashboard.api";

export default function HRDashboard() {

  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadDashboard = async () => {

    try {

      setLoading(true);

      const response = await getHRDashboard();

      // Backend returns { success, data: { totalEmployees, ... } }
      setDashboard(response.data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load dashboard."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadDashboard();

  }, []);

  if (loading) {

    return (

      <DashboardLayout>

        <h2>Loading Dashboard...</h2>

      </DashboardLayout>

    );

  }

  if (error) {

    return (

      <DashboardLayout>

        <h2 style={{ color: "red" }}>
          {error}
        </h2>

      </DashboardLayout>

    );

  }

  if (!dashboard) {

    return (

      <DashboardLayout>

        <h2>No data available</h2>

      </DashboardLayout>

    );

  }

  const statistics = dashboard;

  return (

    <DashboardLayout>

      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "16px",
          marginBottom: "30px",
          boxShadow: "0 6px 18px rgba(0,0,0,.05)",
        }}
      >

        <h1
          style={{
            fontSize: "32px",
            marginBottom: "10px",
            color: "#111827",
          }}
        >
          Welcome, {user?.name || "HR"} 👋
        </h1>

        <p
          style={{
            color: "#6b7280",
            fontSize: "16px",
          }}
        >
          Track goals, reviews and performance from one centralized platform.
        </p>

      </div>

      <DashboardStats
        statistics={statistics}
      />

    </DashboardLayout>

  );

}