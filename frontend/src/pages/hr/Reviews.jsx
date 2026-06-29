import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import ReviewCard from "../../components/reviews/ReviewCard";

import { getHRReviews } from "../../api/user.api";

export default function HRReviews() {

  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [cycleFilter, setCycleFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  const loadReviews = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getHRReviews();

      setReviews(data);
      setFilteredReviews(data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load reviews."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadReviews();

  }, []);

  // Search and filter functionality
  useEffect(() => {
    let filtered = [...reviews];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((review) => {
        const name = review.user?.name?.toLowerCase() || "";
        const email = review.user?.email?.toLowerCase() || "";
        const department = review.user?.department?.toLowerCase() || "";
        const designation = review.user?.designation?.toLowerCase() || "";

        return (
          name.includes(query) ||
          email.includes(query) ||
          department.includes(query) ||
          designation.includes(query)
        );
      });
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Rating filter
    if (ratingFilter !== "ALL") {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter((r) => r.rating === rating);
    }

    // Review cycle filter
    if (cycleFilter !== "ALL") {
      filtered = filtered.filter((r) => r.reviewCycle === cycleFilter);
    }

    // Month filter (only for MONTHLY reviews)
    if (monthFilter !== "ALL") {
      const month = parseInt(monthFilter);
      filtered = filtered.filter((r) => r.reviewCycle === "MONTHLY" && r.reviewMonth === month);
    }

    // Year filter
    if (yearFilter !== "ALL") {
      const year = parseInt(yearFilter);
      filtered = filtered.filter((r) => r.reviewYear === year);
    }

    setFilteredReviews(filtered);
  }, [searchQuery, statusFilter, ratingFilter, cycleFilter, monthFilter, yearFilter, reviews]);

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "PENDING").length,
    completed: reviews.filter((r) => r.status === "COMPLETED").length,
    avgRating: reviews.filter((r) => r.rating).length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.filter((r) => r.rating).length).toFixed(1)
      : "N/A",
  };

  const pendingReviews = filteredReviews.filter((r) => r.status === "PENDING");
  const completedReviews = filteredReviews.filter((r) => r.status === "COMPLETED");

  return (

    <DashboardLayout>

      <div
        style={{
          marginBottom: "30px",
        }}
      >

        <h1 style={{ marginBottom: "20px" }}>All Employee Reviews</h1>

        {/* Search and Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          
          <input
            type="text"
            placeholder="Search by name, email, department, or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: "300px",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) => e.target.style.borderColor = "#2563eb"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />

          <select
            value={cycleFilter}
            onChange={(e) => {
              setCycleFilter(e.target.value);
              if (e.target.value === "YEARLY") {
                setMonthFilter("ALL");
              }
            }}
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="ALL">All Cycles</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>

          {cycleFilter === "MONTHLY" && (
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          )}

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="ALL">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {(searchQuery || statusFilter !== "ALL" || ratingFilter !== "ALL" || cycleFilter !== "ALL" || monthFilter !== "ALL" || yearFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setRatingFilter("ALL");
                setCycleFilter("ALL");
                setMonthFilter("ALL");
                setYearFilter("ALL");
              }}
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                border: "1px solid #dc2626",
                background: "#fff",
                color: "#dc2626",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          )}

        </div>

      </div>

      {/* Stats */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <h3 style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "14px" }}>
            Total Reviews
          </h3>
          <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "700" }}>
            {stats.total}
          </h2>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <h3 style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "14px" }}>
            Pending Reviews
          </h3>
          <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "700", color: "#f59e0b" }}>
            {stats.pending}
          </h2>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <h3 style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "14px" }}>
            Completed Reviews
          </h3>
          <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "700", color: "#16a34a" }}>
            {stats.completed}
          </h2>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <h3 style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: "14px" }}>
            Average Rating
          </h3>
          <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "700", color: "#8b5cf6" }}>
            {stats.avgRating} ⭐
          </h2>
        </div>

      </div>

      {loading && <h2>Loading reviews...</h2>}

      {error && (

        <h2 style={{ color: "red" }}>

          {error}

        </h2>

      )}

      {!loading && filteredReviews.length === 0 && (

        <div
          style={{
            background: "#fff",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <h3>
            {searchQuery || statusFilter !== "ALL" || ratingFilter !== "ALL" || cycleFilter !== "ALL" || monthFilter !== "ALL" || yearFilter !== "ALL"
              ? "No reviews found matching your filters"
              : "No Reviews Found"}
          </h3>
          <p style={{ color: "#6b7280", marginTop: "10px" }}>
            {searchQuery || statusFilter !== "ALL" || ratingFilter !== "ALL" || cycleFilter !== "ALL" || monthFilter !== "ALL" || yearFilter !== "ALL"
              ? "Try adjusting your search or filter criteria."
              : "Reviews will appear here once managers create them."}
          </p>
        </div>

      )}

      {/* Pending Reviews */}

      {!loading && pendingReviews.length > 0 && (

        <>

          <h2 style={{ marginTop: "30px", marginBottom: "20px" }}>
            Pending Reviews ({pendingReviews.length})
          </h2>

          {pendingReviews.map((review) => (

            <div
              key={review.id}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "15px",
                boxShadow: "0 2px 10px rgba(0,0,0,.08)",
              }}
            >

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                
                <div>

                  <h3>{review.user?.name}</h3>

                  <p style={{ color: "#6b7280", margin: "8px 0" }}>
                    <strong>Email:</strong> {review.user?.email || "—"}
                  </p>

                  <p style={{ color: "#6b7280", margin: "8px 0" }}>
                    <strong>Department:</strong> {review.user?.department || "—"}
                  </p>

                  <p style={{ color: "#6b7280", margin: "8px 0" }}>
                    <strong>Designation:</strong> {review.user?.designation || "—"}
                  </p>

                  <p style={{ color: "#6b7280", margin: "8px 0", fontSize: "13px" }}>
                    <strong>Created:</strong> {new Date(review.createdAt).toLocaleDateString()}
                  </p>

                </div>

                <span
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    background: "#fef3c7",
                    color: "#f59e0b",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  PENDING
                </span>

              </div>

            </div>

          ))}

        </>

      )}

      {/* Completed Reviews */}

      {!loading && completedReviews.length > 0 && (

        <>

          <h2 style={{ marginTop: "30px", marginBottom: "20px" }}>
            Completed Reviews ({completedReviews.length})
          </h2>

          {completedReviews.map((review) => (

            <ReviewCard

              key={review.id}

              review={review}

            />

          ))}

        </>

      )}

    </DashboardLayout>

  );

}
