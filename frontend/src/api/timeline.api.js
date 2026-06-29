import api from "./api";

// ==============================
// Get My Timeline (Employee/Manager/HR)
// ==============================

export const getMyTimeline = async () => {

  // Automatically use correct endpoint based on user role
  // Manager will use /manager/timeline
  // Employee will use /employee/timeline
  
  try {
    // Try manager endpoint first if user is manager
    const response = await api.get("/manager/timeline");
    return response.data.data;
  } catch (error) {
    // Fallback to employee endpoint
    const response = await api.get("/employee/timeline");
    return response.data.data;
  }

};

// ==============================
// Get Team Timeline (Manager)
// ==============================

export const getTeamTimeline = async () => {

  const response = await api.get("/manager/team");

  return response.data.data;

};

