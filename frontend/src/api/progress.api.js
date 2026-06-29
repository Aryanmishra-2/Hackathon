import api from "./api";

// ==============================
// Get Employee Progress (My Goals)
// ==============================

export const getMyProgress = async () => {

  const response = await api.get("/employee/goals");

  return response.data.data;

};

// ==============================
// Get Team Progress (Manager)
// ==============================

export const getTeamProgress = async () => {

  const response = await api.get("/manager/goals");

  return response.data.data;

};

// ==============================
// Update Goal Progress
// ==============================

export const updateGoalProgress = async (goalId, progress) => {

  const response = await api.patch(
    `/goals/${goalId}/progress`,
    { progress }
  );

  return response.data.data;

};
