import api from "./api";

// ======================================
// Manager Dashboard
// ======================================

export const getDashboard = async () => {

  const response = await api.get(
    "/manager/dashboard"
  );

  return response.data;

};

// ======================================
// Team Members
// ======================================

export const getTeam = async () => {

  const response = await api.get(
    "/manager/team"
  );

  return response.data.data;

};
// ======================================
// Team Goals
// ======================================

export const getGoals = async () => {

  const response = await api.get(
    "/manager/goals"
  );

  return response.data.data;

};

// ======================================
// Goal Details
// ======================================

export const getGoal = async (id) => {

  const response = await api.get(
    `/manager/goals/${id}`
  );

  return response.data.data;

};

// ======================================
// Approve Goal
// ======================================

export const approveGoal = async (
  id,
  comment = ""
) => {

  const response = await api.patch(
    `/manager/goals/${id}/approve`,
    {
      comment,
    }
  );

  return response.data;

};

// ======================================
// Reject Goal
// ======================================

export const rejectGoal = async (
  id,
  comment = ""
) => {

  const response = await api.patch(
    `/manager/goals/${id}/reject`,
    {
      comment,
    }
  );

  return response.data;

};

// ======================================
// Feedback
// ======================================

export const addFeedback = async (
  id,
  comment
) => {

  const response = await api.post(
    `/manager/goals/${id}/feedback`,
    {
      comment,
    }
  );

  return response.data;

};

// ======================================
// Delete Goal
// ======================================

export const deleteGoal = async (id) => {

  const response = await api.delete(
    `/manager/goals/${id}`
  );

  return response.data;

};
