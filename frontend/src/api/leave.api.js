import api from "./api";

// ======================================
// Employee - Leave Requests
// ======================================

export const createLeaveRequest = async (payload) => {
  const response = await api.post("/leave/employee", payload);
  return response.data.data;
};

export const getEmployeeLeaveRequests = async () => {
  const response = await api.get("/leave/employee");
  return response.data.data;
};

// ======================================
// Manager - Leave Requests
// ======================================

export const getManagerLeaveRequests = async () => {
  const response = await api.get("/leave/manager");
  return response.data.data;
};

export const updateLeaveRequestStatus = async (requestId, payload) => {
  const response = await api.put(`/leave/manager/${requestId}`, payload);
  return response.data.data;
};

// ======================================
// Get Leave Request By ID
// ======================================

export const getLeaveRequestById = async (requestId) => {
  const response = await api.get(`/leave/${requestId}`);
  return response.data.data;
};
