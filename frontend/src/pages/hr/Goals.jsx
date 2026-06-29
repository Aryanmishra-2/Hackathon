import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import HRGoalCard from "../../components/goals/HRGoalCard";

import { getHRGoals } from "../../api/user.api";

export default function HRGoals() {

  const [goals, setGoals] = useState([]);

  const [filteredGoals, setFilteredGoals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  const loadGoals = async () => {

    try {

      setLoading(true);

      const data = await getHRGoals();

      setGoals(data);

      setFilteredGoals(data);

    } catch (err) {

      console.error(err);

      setError(

        err.response?.data?.message ||

        "Failed to load goals."

      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadGoals();

  }, []);

  useEffect(() => {

    const keyword = search.toLowerCase();

    let filtered = goals;

    // Filter by creator type
    if (filter === "MANAGER_CREATED") {
      filtered = filtered.filter((goal) => goal.createdBy?.role === "MANAGER");
    } else if (filter === "EMPLOYEE_CREATED") {
      filtered = filtered.filter((goal) => goal.createdBy?.role === "EMPLOYEE");
    }

    // Filter by search keyword
    filtered = filtered.filter(
      (goal) =>
        goal.title?.toLowerCase().includes(keyword) ||
        goal.owner?.name?.toLowerCase().includes(keyword) ||
        goal.createdBy?.name?.toLowerCase().includes(keyword)
    );

    setFilteredGoals(filtered);

  }, [search, goals, filter]);

  const stats = {
    total: goals.length,
    managerCreated: goals.filter((g) => g.createdBy?.role === "MANAGER").length,
    employeeCreated: goals.filter((g) => g.createdBy?.role === "EMPLOYEE").length,
    pending: goals.filter((g) => g.status === "PENDING").length,
    approved: goals.filter((g) => g.status === "APPROVED").length,
    completed: goals.filter((g) => g.status === "COMPLETED").length,
  };

  return (

    <DashboardLayout>

      <div
        style={{
          marginBottom: "30px",
        }}
      >

        <h1 style={{ marginBottom: "10px" }}>Organization Goals</h1>

        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>
          Monitor all goals across the organization
        </p>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >

          <div
            style={{
              background: "#fff",
              padding: "16px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,.06)",
              border: "1px solid #e5e7eb",
            }}
          >
            <h3 style={{ margin: "0 0 6px 0", color: "#6b7280", fontSize: "13px" }}>
              Total Goals
            </h3>
            <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#111827" }}>
              {stats.total}
            </h2>
          </div>

          <div
            style={{
              background: "#eff6ff",
              padding: "16px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,.06)",
              border: "1px solid #bfdbfe",
            }}
          >
            <h3 style={{ margin: "0 0 6px 0", color: "#1e40af", fontSize: "13px" }}>
              👔 Manager Created
            </h3>
            <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#1e40af" }}>
              {stats.managerCreated}
            </h2>
          </div>

          <div
            style={{
              background: "#f0fdf4",
              padding: "16px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,.06)",
              border: "1px solid #bbf7d0",
            }}
          >
            <h3 style={{ margin: "0 0 6px 0", color: "#15803d", fontSize: "13px" }}>
              👤 Employee Created
            </h3>
            <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#15803d" }}>
              {stats.employeeCreated}
            </h2>
          </div>

          <div
            style={{
              background: "#fffbeb",
              padding: "16px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,.06)",
              border: "1px solid #fde68a",
            }}
          >
            <h3 style={{ margin: "0 0 6px 0", color: "#92400e", fontSize: "13px" }}>
              Pending
            </h3>
            <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#92400e" }}>
              {stats.pending}
            </h2>
          </div>

        </div>

        {/* Filters and Search */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >

          <div style={{ display: "flex", gap: "10px" }}>

            <button
              onClick={() => setFilter("ALL")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: filter === "ALL" ? "2px solid #2563eb" : "1px solid #ddd",
                background: filter === "ALL" ? "#eff6ff" : "#fff",
                cursor: "pointer",
                fontWeight: filter === "ALL" ? "600" : "400",
                fontSize: "14px",
              }}
            >
              All Goals
            </button>

            <button
              onClick={() => setFilter("MANAGER_CREATED")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: filter === "MANAGER_CREATED" ? "2px solid #1e40af" : "1px solid #ddd",
                background: filter === "MANAGER_CREATED" ? "#eff6ff" : "#fff",
                cursor: "pointer",
                fontWeight: filter === "MANAGER_CREATED" ? "600" : "400",
                fontSize: "14px",
              }}
            >
              👔 Manager Created
            </button>

            <button
              onClick={() => setFilter("EMPLOYEE_CREATED")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: filter === "EMPLOYEE_CREATED" ? "2px solid #15803d" : "1px solid #ddd",
                background: filter === "EMPLOYEE_CREATED" ? "#f0fdf4" : "#fff",
                cursor: "pointer",
                fontWeight: filter === "EMPLOYEE_CREATED" ? "600" : "400",
                fontSize: "14px",
              }}
            >
              👤 Employee Created
            </button>

          </div>

          <input

            type="text"

            placeholder="Search Goal / Employee / Creator"

            value={search}

            onChange={(e) => setSearch(e.target.value)}

            style={{
              padding: "10px 16px",
              width: "320px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
            }}

          />

        </div>

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
          <h3>Loading organization goals...</h3>
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

      {!loading &&
        !error &&
        filteredGoals.length === 0 && (

          <div
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <h3>No Goals Found</h3>
            <p style={{ color: "#6b7280", marginTop: "10px" }}>
              {filter === "ALL" 
                ? "No goals created yet."
                : `No goals created by ${filter === "MANAGER_CREATED" ? "managers" : "employees"}.`}
            </p>
          </div>

      )}

      {!loading &&
        !error &&
        filteredGoals.map((goal) => (

          <HRGoalCard

            key={goal.id}

            goal={goal}

          />

        ))}

    </DashboardLayout>

  );

}