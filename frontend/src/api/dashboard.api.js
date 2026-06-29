import api from "./api";

// ======================================
// HR Dashboard
// ======================================

export const getHRDashboard = async () => {

  const response = await api.get(
    "/hr/dashboard"
  );

  return response.data;

};

// ======================================
// Employee Dashboard
// ======================================

export const getEmployeeDashboard = async () => {

  const response = await api.get(
    "/employee/dashboard"
  );

  return response.data;

};

// ======================================
// Manager Dashboard
// ======================================

export const getManagerDashboard = async () => {

  const response = await api.get(
    "/manager/dashboard"
  );

  return response.data;

};

// ======================================
// Backward Compatibility
// (Temporary)
// ======================================

export const getDashboard = async () => {

  const response = await api.get(
    "/hr/dashboard"
  );

  return response.data;

};