import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import ReviewCard from "../../components/reviews/ReviewCard";
import SubmitReviewModal from "../../components/reviews/SubmitReviewModal";

import {
  getManagerReviews,
  createReview,
} from "../../api/review.api";

import { getTeam } from "../../api/manager.api";

export default function Reviews() {

  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);

  const [team, setTeam] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedReview, setSelectedReview] = useState(null);

  const [openReviewModal, setOpenReviewModal] = useState(false);

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [reviewCycle, setReviewCycle] = useState("MONTHLY");
  const [reviewMonth, setReviewMonth] = useState(new Date().getMonth() + 1);
  const [reviewYear, setReviewYear] = useState(new Date().getFullYear());

  // Helper function to get month name
  const getMonthName = (month) => {
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    return months[month - 1] || "Unknown";
  };

  // Helper function to get review period label
  const getReviewPeriodLabel = (review) => {
    if (review.reviewCycle === "MONTHLY" && review.reviewMonth) {
      return `${getMonthName(review.reviewMonth)} ${review.reviewYear}`;
    } else if (review.reviewCycle === "YEARLY") {
      return `Year ${review.reviewYear}`;
    }
    return "N/A";
  };

  const loadData = async () => {

    try {

      setLoading(true);

      const [reviewsData, teamData] = await Promise.all([
        getManagerReviews(),
        getTeam(),
      ]);

      setReviews(reviewsData.data);
      setFilteredReviews(reviewsData.data);

      setTeam(teamData);

    } catch (err) {

      console.error(err);

      setError(

        err.response?.data?.message ||

        "Failed to load data."

      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadData();

  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReviews(reviews);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = reviews.filter((review) => {
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

    setFilteredReviews(filtered);
  }, [searchQuery, reviews]);

  const handleOpenReview = (review) => {

    setSelectedReview(review);

    setOpenReviewModal(true);

  };

  const handleCreateReview = async () => {

    if (!selectedEmployee) {
      alert("Please select an employee.");
      return;
    }

    if (reviewCycle === "MONTHLY" && (!reviewMonth || reviewMonth < 1 || reviewMonth > 12)) {
      alert("Please select a valid month.");
      return;
    }

    if (!reviewYear) {
      alert("Please select a year.");
      return;
    }

    try {

      await createReview({ 
        userId: selectedEmployee,
        reviewCycle,
        reviewMonth: reviewCycle === "MONTHLY" ? reviewMonth : null,
        reviewYear,
      });

      alert("Review created successfully. Now you can submit it.");

      setOpenCreateModal(false);

      setSelectedEmployee("");
      setReviewCycle("MONTHLY");
      setReviewMonth(new Date().getMonth() + 1);
      setReviewYear(new Date().getFullYear());

      loadData();

    } catch (err) {

      console.error(err);

      alert(

        err.response?.data?.message ||

        "Failed to create review."

      );

    }

  };

  const handleReviewSuccess = () => {

    setSelectedReview(null);

    setOpenReviewModal(false);

    loadData();

  };

  const pendingReviews = filteredReviews.filter((r) => r.status === "PENDING");

  const completedReviews = filteredReviews.filter((r) => r.status === "COMPLETED");

  return (

    <DashboardLayout>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          gap: "20px",
        }}
      >

        <h1>Team Reviews</h1>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1, maxWidth: "600px" }}>
          
          <input
            type="text"
            placeholder="Search by name, email, department, or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) => e.target.style.borderColor = "#2563eb"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />

          <button
            onClick={() => setOpenCreateModal(true)}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              whiteSpace: "nowrap",
            }}
          >
            + Create Review
          </button>
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
            {reviews.length}
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
            {pendingReviews.length}
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
            {completedReviews.length}
          </h2>
        </div>

      </div>

      {loading && <h2>Loading...</h2>}

      {error && (

        <h2 style={{ color: "red" }}>

          {error}

        </h2>

      )}

      {

        !loading &&

        filteredReviews.length === 0 && (

          <div
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <h3>{searchQuery ? "No reviews found matching your search" : "No Reviews Found"}</h3>
            <p style={{ color: "#6b7280", marginTop: "10px" }}>
              {searchQuery 
                ? `Try adjusting your search query: "${searchQuery}"`
                : "Create a review for your team members to get started."}
            </p>
          </div>

        )

      }

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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >

              <div>

                <h3>{review.user?.name}</h3>

                <p style={{ color: "#6b7280", margin: "8px 0" }}>
                  <strong>Department:</strong> {review.user?.department || "—"}
                </p>

                <p style={{ color: "#6b7280", margin: "8px 0" }}>
                  <strong>Designation:</strong> {review.user?.designation || "—"}
                </p>

                <p style={{ color: "#2563eb", margin: "8px 0", fontWeight: "600", fontSize: "14px" }}>
                  📅 {getReviewPeriodLabel(review)}
                </p>

                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    background: "#fef3c7",
                    color: "#f59e0b",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  PENDING
                </span>

              </div>

              <button
                onClick={() => handleOpenReview(review)}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Submit Review
              </button>

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

      {/* Submit Review Modal */}

      {selectedReview && (

        <SubmitReviewModal

          open={openReviewModal}

          review={selectedReview}

          onClose={() => {
            setSelectedReview(null);
            setOpenReviewModal(false);
          }}

          onSuccess={handleReviewSuccess}

        />

      )}

      {/* Create Review Modal */}

      {openCreateModal && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >

          <div
            style={{
              background: "#fff",
              padding: "30px",
              width: "550px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "12px",
            }}
          >

            <h2>Create Performance Review</h2>

            <p style={{ color: "#6b7280", marginTop: "10px", marginBottom: "20px" }}>
              Select an employee and review period to create a performance review.
            </p>

            <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>
              Select Employee
            </label>

            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              <option value="">-- Choose Team Member --</option>

              {team.map((member) => (

                <option key={member.id} value={member.id}>
                  {member.name} ({member.designation || member.department || member.email})
                </option>

              ))}

            </select>

            <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>
              Review Type
            </label>

            <select
              value={reviewCycle}
              onChange={(e) => setReviewCycle(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              <option value="MONTHLY">Monthly Review</option>
              <option value="YEARLY">Yearly Review</option>
            </select>

            {reviewCycle === "MONTHLY" && (
              <>
                <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>
                  Select Month
                </label>

                <select
                  value={reviewMonth}
                  onChange={(e) => setReviewMonth(parseInt(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    marginBottom: "20px",
                    fontSize: "14px",
                  }}
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
              </>
            )}

            <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>
              Select Year
            </label>

            <select
              value={reviewYear}
              onChange={(e) => setReviewYear(parseInt(e.target.value))}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {[2026, 2025, 2024, 2023, 2022].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >

              <button
                onClick={() => {
                  setOpenCreateModal(false);
                  setSelectedEmployee("");
                  setReviewCycle("MONTHLY");
                  setReviewMonth(new Date().getMonth() + 1);
                  setReviewYear(new Date().getFullYear());
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleCreateReview}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Create Review
              </button>

            </div>

          </div>

        </div>

      )}

    </DashboardLayout>

  );

}
