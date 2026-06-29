const aiService = require("../services/ai.service");

// ==========================================
// Generate AI Performance Review
// ==========================================

exports.generateAIReview = async (req, res) => {
  try {
    const { employeeId, reviewCycle, reviewMonth, reviewYear } = req.body;
    const managerId = req.user.id;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required.",
      });
    }

    if (!reviewCycle || !["MONTHLY", "YEARLY"].includes(reviewCycle)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review cycle. Must be MONTHLY or YEARLY.",
      });
    }

    if (!reviewYear) {
      return res.status(400).json({
        success: false,
        message: "Review year is required.",
      });
    }

    if (reviewCycle === "MONTHLY" && (!reviewMonth || reviewMonth < 1 || reviewMonth > 12)) {
      return res.status(400).json({
        success: false,
        message: "Valid review month (1-12) is required for monthly reviews.",
      });
    }

    // Generate AI review
    const result = await aiService.generatePerformanceReview(
      employeeId,
      managerId,
      { reviewCycle, reviewMonth, reviewYear }
    );

    return res.status(200).json({
      success: true,
      message: "AI review generated successfully.",
      data: result.data,
      performanceData: result.performanceData,
    });
  } catch (error) {
    console.error("Error in generateAIReview:", error);

    // Check for specific error types
    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI review.",
    });
  }
};
