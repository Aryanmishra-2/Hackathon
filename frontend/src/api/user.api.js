import api from "./api";

// ======================================
// Users
// ======================================

export const getUsers = async () => {
  const response = await api.get("/hr/users");
  return response.data.data;
};

export const getUser = async (id) => {
  const response = await api.get(`/hr/users/${id}`);
  return response.data.data;
};

export const createUser = async (payload) => {
  const response = await api.post("/hr/users", payload);
  return response.data.data;
};

export const updateUser = async (id, payload) => {
  const response = await api.put(`/hr/users/${id}`, payload);
  return response.data.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/hr/users/${id}`);
  return response.data;
};

// ======================================
// Archived Users
// ======================================

export const getArchivedUsers = async () => {
  const response = await api.get("/hr/users/archived/all");
  return response.data.data;
};

export const restoreUser = async (id) => {
  const response = await api.patch(`/hr/users/${id}/restore`);
  return response.data;
};

// ======================================
// Managers
// ======================================

export const getManagers = async () => {
  const response = await api.get("/hr/managers");
  return response.data.data;
};

// ======================================
// HR — All Goals (monitoring)
// ======================================

export const getHRGoals = async () => {
  const response = await api.get("/hr/goals");
  return response.data.data;
};

// ======================================
// HR — All Reviews (monitoring)
// ======================================

export const getHRReviews = async () => {
  const response = await api.get("/hr/reviews");
  return response.data.data;
};
