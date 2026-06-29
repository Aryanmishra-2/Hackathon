import api from "./api";

// ======================================
// Get My Notifications (Employee/Manager/HR)
// ======================================

export const getMyNotifications = async () => {

  // Automatically use correct endpoint based on user role
  // Manager will use /manager/notifications
  // Employee will use /employee/notifications
  
  try {
    // Try manager endpoint first if user is manager
    const response = await api.get("/manager/notifications");
    return response.data.data;
  } catch (error) {
    // Fallback to employee endpoint
    const response = await api.get("/employee/notifications");
    return response.data.data;
  }

};

// ======================================
// Mark One Notification Read
// ======================================

export const markAsRead = async (id) => {

  try {
    const response = await api.patch(
      `/manager/notifications/${id}/read`
    );
    return response.data;
  } catch (error) {
    const response = await api.patch(
      `/employee/notifications/${id}/read`
    );
    return response.data;
  }

};

// ======================================
// Mark All Notifications Read
// ======================================

export const markAllAsRead = async () => {

  try {
    const response = await api.put(
      "/manager/notifications/read-all"
    );
    return response.data;
  } catch (error) {
    const response = await api.put(
      "/employee/notifications/read-all"
    );
    return response.data;
  }

};

