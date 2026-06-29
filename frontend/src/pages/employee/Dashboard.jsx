import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";

import DashboardStats from "../../components/ui/DashboardStats";

import { getEmployeeDashboard } from "../../api/dashboard.api";

export default function Dashboard() {

  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    let mounted = true;

    (async () => {

      try {

        const response = await getEmployeeDashboard();

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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "22px",
          fontWeight: "600",
        }}
      >
        Loading Dashboard...
      </div>
    );

  }

  if (error) {

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "red",
          fontSize: "18px",
        }}
      >
        {error}
      </div>
    );

  }

  const statistics = dashboard;

  return (

    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f7fb",
      }}
    >

      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >

        <Header />

        <main
          style={{
            padding: "30px",
          }}
        >

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "30px",
              boxShadow: "0 6px 18px rgba(0,0,0,.05)",
              marginBottom: "30px",
            }}
          >

            <h1
              style={{
                fontSize: "32px",
                marginBottom: "10px",
                color: "#111827",
              }}
            >
              Welcome, {user?.name} 👋
            </h1>

            <p
              style={{
                color: "#6b7280",
                fontSize: "16px",
              }}
            >
              Track your goals, reviews and performance from one centralized platform.
            </p>

          </div>

          <DashboardStats
            statistics={statistics}
          />

        </main>

      </div>

    </div>

  );

}