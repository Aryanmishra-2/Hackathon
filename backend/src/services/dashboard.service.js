const prisma = require("../config/prisma");

class DashboardService {

  // ==========================================
  // Employee Dashboard
  // ==========================================

  async employeeDashboard(userId) {

    const [
      totalGoals,
      completedGoals,
      pendingGoals,
      rejectedGoals,
      goals,
      timeline,
      notifications,
      reviews
    ] = await Promise.all([

      prisma.goal.count({
        where: {
          ownerId: userId,
        },
      }),

      prisma.goal.count({
        where: {
          ownerId: userId,
          status: "COMPLETED",
        },
      }),

      prisma.goal.count({
        where: {
          ownerId: userId,
          status: "PENDING",
        },
      }),

      prisma.goal.count({
        where: {
          ownerId: userId,
          status: "REJECTED",
        },
      }),

      prisma.goal.findMany({

        where: {
          ownerId: userId,
        },

        orderBy: {
          updatedAt: "desc",
        },

        take: 5,

      }),

      prisma.timeline.findMany({

        where: {
          userId,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 10,

      }),

      prisma.notification.findMany({

        where: {
          userId,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 10,

      }),

      prisma.review.findMany({

        where: {
          userId,
        },

      })

    ]);

    const totalProgress = goals.reduce(
      (sum, goal) => sum + goal.progress,
      0
    );

    const averageProgress =
      totalGoals === 0
        ? 0
        : Math.round(totalProgress / totalGoals);

    return {

      statistics: {

        totalGoals,

        completedGoals,

        pendingGoals,

        rejectedGoals,

        averageProgress,

      },

      recentGoals: goals,

      timeline,

      notifications,

      reviews,

    };

  }
    // ==========================================
  // Manager Dashboard
  // ==========================================

  async managerDashboard(managerId) {

    const team = await prisma.user.findMany({
      where: {
        managerId,
      },
      select: {
        id: true,
      },
    });

    const teamIds = team.map((user) => user.id);

    const [
      totalEmployees,
      totalGoals,
      pendingGoals,
      approvedGoals,
      rejectedGoals,
      completedGoals,
      goals,
      timeline,
      notifications
    ] = await Promise.all([

      prisma.user.count({
        where: {
          managerId,
        },
      }),

      prisma.goal.count({
        where: {
          ownerId: {
            in: teamIds,
          },
        },
      }),

      prisma.goal.count({
        where: {
          ownerId: {
            in: teamIds,
          },
          status: "PENDING",
        },
      }),

      prisma.goal.count({
        where: {
          ownerId: {
            in: teamIds,
          },
          status: "APPROVED",
        },
      }),

      prisma.goal.count({
        where: {
          ownerId: {
            in: teamIds,
          },
          status: "REJECTED",
        },
      }),

      prisma.goal.count({
        where: {
          ownerId: {
            in: teamIds,
          },
          status: "COMPLETED",
        },
      }),

      prisma.goal.findMany({
        where: {
          ownerId: {
            in: teamIds,
          },
        },
        include: {
          owner: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 10,
      }),

      prisma.timeline.findMany({
        where: {
          userId: {
            in: teamIds,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),

      prisma.notification.findMany({
        where: {
          userId: managerId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      })

    ]);

    const totalProgress = goals.reduce(
      (sum, goal) => sum + goal.progress,
      0
    );

    const averageProgress =
      totalGoals === 0
        ? 0
        : Math.round(totalProgress / totalGoals);

    return {

      statistics: {

        totalEmployees,

        totalGoals,

        pendingGoals,

        approvedGoals,

        rejectedGoals,

        completedGoals,

        averageProgress,

      },

      recentGoals: goals,

      timeline,

      notifications,

    };

  }

  // ==========================================
  // HR Dashboard
  // ==========================================

  async hrDashboard() {

    const [
      totalEmployees,
      totalManagers,
      totalHR,
      totalGoals,
      pendingGoals,
      approvedGoals,
      rejectedGoals,
      completedGoals,
      users,
      goals
    ] = await Promise.all([

      prisma.user.count({
        where: {
          role: "EMPLOYEE",
        },
      }),

      prisma.user.count({
        where: {
          role: "MANAGER",
        },
      }),

      prisma.user.count({
        where: {
          role: "HR",
        },
      }),

      prisma.goal.count(),

      prisma.goal.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.goal.count({
        where: {
          status: "APPROVED",
        },
      }),

      prisma.goal.count({
        where: {
          status: "REJECTED",
        },
      }),

      prisma.goal.count({
        where: {
          status: "COMPLETED",
        },
      }),

      prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),

      prisma.goal.findMany({
        include: {
          owner: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      })

    ]);

    const totalProgress = goals.reduce(
      (sum, goal) => sum + goal.progress,
      0
    );

    const averageProgress =
      totalGoals === 0
        ? 0
        : Math.round(totalProgress / totalGoals);

    return {

      statistics: {

        totalEmployees,

        totalManagers,

        totalHR,

        totalGoals,

        pendingGoals,

        approvedGoals,

        rejectedGoals,

        completedGoals,

        averageProgress,

      },

      recentUsers: users,

      recentGoals: goals,

    };

  }

}

module.exports = new DashboardService();