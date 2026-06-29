import api from "./api";

// =============================
// Get My Goals
// =============================
export const getGoals = async () => {
  const response = await api.get("/goals");
  return response.data.data;
};

// =============================
// Get Goal By Id
// =============================
export const getGoal = async (id) => {
  const response = await api.get(`/goals/${id}`);
  return response.data.data;
};

// =============================
// Create Goal
// =============================
export const createGoal = async (data) => {
  const response = await api.post("/goals", data);
  return response.data.data;
};

// =============================
// Update Goal
// =============================
export const updateGoal = async (id, data) => {
  const response = await api.put(`/goals/${id}`, data);
  return response.data.data;
};

// =============================
// Delete Goal
// =============================
export const deleteGoal = async (id) => {
  const response = await api.delete(`/goals/${id}`);
  return response.data;
};

// =============================
// Update Progress
// =============================
export const updateProgress = async (id, progress) => {
  const response = await api.patch(`/goals/${id}/progress`, {
    progress,
  });

  return response.data.data;
};

// =============================
// Approve Goal
// =============================
export const approveGoal = async (id, comment) => {
  const response = await api.patch(`/goals/${id}/approve`, {
    comment,
  });

  return response.data.data;
};

// =============================
// Reject Goal
// =============================
export const rejectGoal = async (id, comment) => {
  const response = await api.patch(`/goals/${id}/reject`, {
    comment,
  });

  return response.data.data;
};

// =============================
// Add Feedback
// =============================
export const addFeedback = async (id, comment) => {
  const response = await api.post(`/goals/${id}/feedback`, {
    comment,
  });

  return response.data.data;
};