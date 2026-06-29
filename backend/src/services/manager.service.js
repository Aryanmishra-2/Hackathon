const prisma = require("../config/prisma");

class ManagerService {

  // ==========================================
  // Dashboard
  // ==========================================

  async getDashboard(managerId) {

    const totalEmployees = await prisma.user.count({
      where: {
        managerId,
        role: "EMPLOYEE",
      },
    });

    const pendingGoals = await prisma.goal.count({
      where: {
        owner: {
          managerId,
        },
        status: "PENDING",
      },
    });

    const approvedGoals = await prisma.goal.count({
      where: {
        owner: {
          managerId,
        },
        status: "APPROVED",
      },
    });

    const completedGoals = await prisma.goal.count({
      where: {
        owner: {
          managerId,
        },
        status: "COMPLETED",
      },
    });

    const pendingReviews = await prisma.review.count({
      where: {
        status: "PENDING",
        user: {
          managerId,
        },
      },
    });

    const completedReviews = await prisma.review.count({
      where: {
        status: "COMPLETED",
        user: {
          managerId,
        },
      },
    });

    return {
      totalEmployees,
      pendingGoals,
      approvedGoals,
      completedGoals,
      pendingReviews,
      completedReviews,
    };

  }

  // ==========================================
  // Team Members
  // ==========================================

  async getTeam(managerId) {

    return prisma.user.findMany({

      where: {
        managerId,
      },

      select: {

        id: true,
        name: true,
        email: true,
        department: true,
        designation: true,

      },

      orderBy: {
        name: "asc",
      },

    });

  }

  // ==========================================
  // Pending Goals
  // ==========================================

  async getPendingGoals(managerId) {

    return prisma.goal.findMany({

      where: {

        owner: {
          managerId,
        },

        status: "PENDING",

      },

      include: {

        owner: true,

        feedbacks: true,

      },

      orderBy: {

        createdAt: "desc",

      },

    });

  }

}

module.exports = new ManagerService();