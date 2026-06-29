import { useState } from "react";

import { submitReview } from "../../api/review.api";
import { generateAIReview } from "../../api/ai.api";

export default function SubmitReviewModal({
  open,
  review,
  onClose,
  onSuccess,
}) {

  const [form, setForm] = useState({
    rating: review?.rating || 1,
    feedback: review?.feedback || "",
  });

  const [aiData, setAiData] = useState(null);
  const [showAIDetails, setShowAIDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  if (!open || !review) return null;

  const getMonthName = (month) => {
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    return months[month - 1] || "Unknown";
  };

  const getReviewPeriodLabel = () => {
    if (review.reviewCycle === "MONTHLY" && review.reviewMonth) {
      return `${getMonthName(review.reviewMonth)} ${review.reviewYear}`;
    } else if (review.reviewCycle === "YEARLY") {
      return `Year ${review.reviewYear}`;
    }
    return "N/A";
  };

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  // ==========================================
  // Generate AI Review
  // ==========================================

  const handleGenerateAIReview = async () => {
    try {
      setAiLoading(true);

      const response = await generateAIReview(
        review.userId,
        review.reviewCycle,
        review.reviewMonth,
        review.reviewYear
      );

      if (response.success) {
        setAiData(response.data);
        setShowAIDetails(true);

        // Auto-fill form with AI suggestions
        setForm({
          rating: response.data.rating,
          feedback: response.data.performanceSummary,
        });

        alert("AI Review Generated Successfully! You can edit the content before submitting.");
      }
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
        "Failed to generate AI review. Please check your AWS credentials."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // ==========================================
  // Use AI Suggestions
  // ==========================================

  const handleUseAISuggestion = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      await submitReview(review.id, {
        rating: Number(form.rating),
        feedback: form.feedback,
        aiData: aiData, // Include AI data if available
      });

      alert("Review Submitted Successfully");

      onSuccess();

      onClose();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to submit review."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.45)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999,
        }}
      >

      <div
        style={{
          width: "850px",
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: "14px",
          padding: "30px",
        }}
      >

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h2 style={{ margin: 0 }}>Submit Performance Review</h2>
          
          <button
            type="button"
            onClick={handleGenerateAIReview}
            disabled={aiLoading}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: aiLoading ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: aiLoading ? 0.7 : 1,
            }}
          >
            {aiLoading ? (
              <>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</span>
                Generating...
              </>
            ) : (
              <>
                🤖 Generate AI Review
              </>
            )}
          </button>
        </div>

        <p style={{ color: "#6b7280", marginBottom: "5px" }}>
          Employee: <strong>{review.user?.name}</strong>
        </p>
        <p style={{ color: "#2563eb", fontWeight: "600", marginBottom: "20px" }}>
          📅 Review Period: {getReviewPeriodLabel()}
        </p>

        {/* AI Insights Panel */}
        {aiData && showAIDetails && (
          <div
            style={{
              background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
              border: "2px solid #667eea",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "25px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: 0, color: "#667eea", display: "flex", alignItems: "center", gap: "8px" }}>
                🤖 AI Performance Analysis
              </h3>
              <button
                onClick={() => setShowAIDetails(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#667eea",
                }}
              >
                ✕
              </button>
            </div>

            {/* AI Rating */}
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#374151" }}>
                AI Suggested Rating
              </h4>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "24px", fontWeight: "700", color: "#667eea" }}>
                  {aiData.rating}/5 {"⭐".repeat(aiData.rating)}
                </span>
                {form.rating !== aiData.rating && (
                  <button
                    type="button"
                    onClick={() => handleUseAISuggestion("rating", aiData.rating)}
                    style={{
                      background: "#667eea",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Use This Rating
                  </button>
                )}
              </div>
            </div>

            {/* Performance Summary */}
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#374151" }}>
                Performance Summary
              </h4>
              <p style={{ margin: 0, padding: "10px", background: "#fff", borderRadius: "6px", fontSize: "14px", lineHeight: "1.6" }}>
                {aiData.performanceSummary}
              </p>
              {form.feedback !== aiData.performanceSummary && (
                <button
                  type="button"
                  onClick={() => handleUseAISuggestion("feedback", aiData.performanceSummary)}
                  style={{
                    background: "#667eea",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    marginTop: "8px",
                  }}
                >
                  Use This Summary
                </button>
              )}
            </div>

            {/* Strengths */}
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#374151" }}>
                💪 Strengths
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px" }}>
                {aiData.strengths.map((strength, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>{strength}</li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#374151" }}>
                📈 Areas for Improvement
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px" }}>
                {aiData.areasForImprovement.map((area, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>{area}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#374151" }}>
                💡 Recommendations
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px" }}>
                {aiData.recommendations.map((rec, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>{rec}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: "15px", padding: "10px", background: "#fef3c7", borderRadius: "6px", fontSize: "12px", color: "#92400e" }}>
              ℹ️ <strong>Note:</strong> AI suggestions are based on performance data. You can edit the rating and feedback below before submitting.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label style={{ fontWeight: "600" }}>Rating</label>

          <br />

          <select
            name="rating"
            value={form.rating}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", marginTop: "8px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #ddd" }}
          >
            <option value="1">1 ⭐</option>
            <option value="2">2 ⭐⭐</option>
            <option value="3">3 ⭐⭐⭐</option>
            <option value="4">4 ⭐⭐⭐⭐</option>
            <option value="5">5 ⭐⭐⭐⭐⭐</option>
          </select>

          <label style={{ fontWeight: "600" }}>Feedback</label>

          <textarea
            rows="6"
            name="feedback"
            placeholder="Write your feedback about this employee's performance..."
            value={form.feedback}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", marginTop: "8px", borderRadius: "8px", border: "1px solid #ddd", resize: "vertical" }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
            }}
          >

            <button
              type="button"
              onClick={onClose}
              style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #ddd", cursor: "pointer" }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{ padding: "10px 20px", borderRadius: "8px", background: "#2563eb", color: "#fff", border: "none", cursor: "pointer" }}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>

          </div>

        </form>

      </div>

    </div>

    </>

  );

}
