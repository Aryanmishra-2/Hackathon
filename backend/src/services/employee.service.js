const prisma = require("../config/prisma");

class EmployeeService {

  // ==========================================
  // Dashboard
  // ==========================================

  async getDashboard(userId) {

    const totalGoals = await prisma.goal.count({
      where: {
        ownerId: userId,
      },
    });

    const pendingGoals = await prisma.goal.count({
      where: {
        ownerId: userId,
        status: "PENDING",
      },
    });

    const approvedGoals = await prisma.goal.count({
      where: {
        ownerId: userId,
        status: "APPROVED",
      },
    });

    const completedGoals = await prisma.goal.count({
      where: {
        ownerId: userId,
        status: "COMPLETED",
      },
    });

    const pendingReviews = await prisma.review.count({
      where: {
        userId,
        status: "PENDING",
      },
    });

    const completedReviews = await prisma.review.count({
      where: {
        userId,
        status: "COMPLETED",
      },
    });

    const averageProgress = await prisma.goal.aggregate({
      where: {
        ownerId: userId,
      },
      _avg: {
        progress: true,
      },
    });

    return {

      totalGoals,

      pendingGoals,

      approvedGoals,

      completedGoals,

      pendingReviews,

      completedReviews,

      averageProgress:
        Math.round(
          averageProgress._avg.progress || 0
        ),

    };

  }

  // ==========================================
  // Employee Profile
  // ==========================================

  async getProfile(userId) {

    const user = await prisma.user.findUnique({

      where: {
        id: userId,
      },

      include: {

        manager: {

          select: {

            id: true,
            name: true,
            email: true,
            department: true,
            designation: true,

          },

        },

      },

    });

    if (!user) {

      throw new Error("Employee not found.");

    }

    return user;

  }

  // ==========================================
  // Reviews
  // ==========================================

  async getReviews(userId) {

    return prisma.review.findMany({

      where: {
        userId,
      },

      orderBy: {
        createdAt: "desc",
      },

    });

  }

  // ==========================================
  // Timeline
  // ==========================================

  async getTimeline(userId) {

    return prisma.timeline.findMany({

      where: {
        userId,
      },

      orderBy: {
        createdAt: "desc",
      },

    });

  }

  // ==========================================
  // Notifications
  // ==========================================

  async getNotifications(userId) {

    return prisma.notification.findMany({

      where: {
        userId,
      },

      orderBy: {
        createdAt: "desc",
      },

    });

  }

  // ==========================================
  // Mark Single Notification Read
  // ==========================================

  async markNotification(id) {

    await prisma.notification.update({

      where: { id },

      data: { isRead: true },

    });

    return true;

  }

  // ==========================================
  // Mark All Notifications Read
  // ==========================================

  async markAllNotifications(userId) {

    await prisma.notification.updateMany({

      where: {
        userId,
        isRead: false,
      },

      data: {
        isRead: true,
      },

    });

    return true;

  }

}

module.exports = new EmployeeService();