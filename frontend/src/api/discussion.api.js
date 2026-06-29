import api from "./api";

// ==========================================
// Create Comment
// ==========================================

export const createComment = async (goalId, message) => {
  const response = await api.post("/discussions", {
    goalId,
    message,
  });
  return response.data.data;
};

// ==========================================
// Get All Comments for a Goal
// ==========================================

export const getGoalComments = async (goalId) => {
  const response = await api.get(`/discussions/goal/${goalId}`);
  return response.data.data;
};

// ==========================================
// Update Comment
// ==========================================

export const updateComment = async (commentId, message) => {
  const response = await api.put(`/discussions/${commentId}`, {
    message,
  });
  return response.data.data;
};

// ==========================================
// Delete Comment
// ==========================================

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/discussions/${commentId}`);
  return response.data;
};
