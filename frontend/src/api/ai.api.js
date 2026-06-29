import api from "./api";

// ==========================================
// Generate AI Performance Review
// ==========================================

export const generateAIReview = async (employeeId, reviewCycle, reviewMonth, reviewYear) => {
  const response = await api.post("/ai/generate-review", {
    employeeId,
    reviewCycle,
    reviewMonth,
    reviewYear,
  });
  return response.data;
};
