import api from "./api";

// ======================================
// Employee Reviews
// ======================================

export const getEmployeeReviews = async () => {

  const response = await api.get(
    "/reviews/employee"
  );

  return response.data;

};

export const createReview = async (payload) => {

  const response = await api.post(
    "/reviews/manager",
    payload
  );

  return response.data;

};

// ======================================
// Manager Reviews
// ======================================

export const getManagerReviews = async () => {

  const response = await api.get(
    "/reviews/manager"
  );

  return response.data;

};

export const getManagerReview = async (id) => {

  const response = await api.get(
    `/reviews/manager/${id}`
  );

  return response.data;

};

export const submitReview = async (
  id,
  payload
) => {

  const response = await api.put(
    `/reviews/manager/${id}`,
    payload
  );

  return response.data;

};

// ======================================
// HR Reviews
// ======================================

export const getAllReviews = async () => {

  const response = await api.get(
    "/reviews/hr"
  );

  return response.data;

};

export const getReviewStats = async () => {

  const response = await api.get(
    "/reviews/hr/stats"
  );

  return response.data;

};