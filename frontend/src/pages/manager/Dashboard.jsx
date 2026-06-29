import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import DashboardStats from "../../components/ui/DashboardStats";

import { useAuth } from "../../context/AuthContext";

import { getManagerDashboard } from "../../api/dashboard.api";

const ManagerDashboard = () => {

  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    let mounted = true;

    (async () => {

      try {

        const response = await getManagerDashboard();

        if (mounted) {

          setDashboard(response.data);

        }

      } catch (err) {

        console.error(err);

        if (mounted) {

          setError(
            err.response?.data?.message ||
            "Failed to load dashboard."
          );

        }

      } finally {

        if (mounted) {

          setLoading(false);

        }

      }

    })();

    return () => {

      mounted = false;

    };

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

  const statistics = dashboard;

  return (

    <DashboardLayout>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "30px",
          marginBottom: "30px",
          boxShadow: "0 6px 18px rgba(0,0,0,.05)",
        }}
      >

        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "10px",
          }}
        >
          Welcome, {user?.name || "Manager"} 👋
        </h1>

        <p
          style={{
            color: "#6b7280",
            fontSize: "16px",
          }}
        >
          Monitor your team's goals, approvals and performance.
        </p>

      </div>

      <DashboardStats
        statistics={statistics}
      />

    </DashboardLayout>

  );

};

export default ManagerDashboard;