const prisma = require("../config/prisma");

class GoalService {

  // ====================================================
  // Create Goal
  // ====================================================

  async createGoal(data) {

    const {
      title,
      description,
      ownerId,
      createdById,
      startDate,
      endDate,
    } = data;

    if (!title || !description) {
      throw new Error("Title and Description are required.");
    }

    if (!ownerId) {
      throw new Error("Goal owner is required.");
    }

    // Convert date strings to ISO-8601 DateTime format
    const startDateTime = new Date(startDate).toISOString();
    const endDateTime = new Date(endDate).toISOString();

    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error("End Date must be greater than Start Date.");
    }

    const owner = await prisma.user.findUnique({
      where: {
        id: ownerId,
      },
    });

    if (!owner) {
      throw new Error("Employee not found.");
    }

    const creator = await prisma.user.findUnique({
      where: {
        id: createdById,
      },
    });

    if (!creator) {
      throw new Error("Creator not found.");
    }

    const duplicateGoal = await prisma.goal.findFirst({
      where: {
        ownerId,
        title,
        status: {
          not: "COMPLETED",
        },
      },
    });

    if (duplicateGoal) {
      throw new Error(
        "Goal with same title already exists."
      );
    }

    return await prisma.$transaction(async (tx) => {

      const goal = await tx.goal.create({

        data: {
          title,
          description,
          ownerId,
          createdById,
          startDate: startDateTime,
          endDate: endDateTime,
        },

        include: {

          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              designation: true,
            },
          },

          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },

          approvedBy: {
            select: {
              id: true,
              name: true,
            },
          },

        },

      });

      await tx.timeline.create({

        data: {

          title: "Goal Created",

          description: `${creator.name} created goal "${goal.title}".`,

          userId: ownerId,

        },

      });

      await tx.notification.create({

        data: {

          title: "New Goal Assigned",

          message: `${goal.title} has been assigned.`,

          type: "GOAL",

          userId: ownerId,

        },

      });

      return goal;

    });

  }

  // ====================================================
  // Employee Goals
  // ====================================================

  async getEmployeeGoals(ownerId) {

    return prisma.goal.findMany({

      where: {
        ownerId,
      },

      include: {

        owner: true,

        createdBy: true,

        approvedBy: true,

        feedbacks: {

          include: {

            manager: {

              select: {
                id: true,
                name: true,
              },

            },

          },

          orderBy: {
            createdAt: "desc",
          },

        },

      },

      orderBy: {

        createdAt: "desc",

      },

    });

  }

  // ====================================================
  // Manager Goals
  // ====================================================

  async getManagerGoals(managerId) {

    return prisma.goal.findMany({

      where: {

        owner: {

          managerId,

        },

      },

      include: {

        owner: {

          select: {

            id: true,
            name: true,
            email: true,
            department: true,
            designation: true,

          },

        },

        createdBy: {

          select: {

            id: true,
            name: true,

          },

        },

        approvedBy: {

          select: {

            id: true,
            name: true,

          },

        },

        feedbacks: {

          include: {

            manager: {

              select: {

                id: true,
                name: true,

              },

            },

          },

          orderBy: {

            createdAt: "desc",

          },

        },

      },

      orderBy: {

        createdAt: "desc",

      },

    });

  }
  // ====================================================
  // Get Goal By Id
  // ====================================================

  async getGoalById(id) {

    const goal = await prisma.goal.findUnique({

      where: {
        id,
      },

      include: {

        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            designation: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },

        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },

        feedbacks: {

          include: {

            manager: {
              select: {
                id: true,
                name: true,
              },
            },

          },

          orderBy: {
            createdAt: "desc",
          },

        },

      },

    });

    if (!goal) {

      throw new Error("Goal not found.");

    }

    return goal;

  }

  // ====================================================
  // Update Goal
  // ====================================================

  async updateGoal(goalId, data) {

    return prisma.$transaction(async (tx) => {

      const goal = await tx.goal.findUnique({

        where: {
          id: goalId,
        },

      });

      if (!goal) {

        throw new Error("Goal not found.");

      }

      if (goal.status === "APPROVED") {

        throw new Error(
          "Approved goal cannot be edited."
        );

      }

      if (
        data.startDate &&
        data.endDate &&
        new Date(data.startDate) >= new Date(data.endDate)
      ) {

        throw new Error(
          "End Date must be greater than Start Date."
        );

      }

      // Convert dates to ISO format if provided
      const updateData = {
        title: data.title ?? goal.title,
        description: data.description ?? goal.description,
      };

      if (data.startDate) {
        updateData.startDate = new Date(data.startDate).toISOString();
      } else {
        updateData.startDate = goal.startDate;
      }

      if (data.endDate) {
        updateData.endDate = new Date(data.endDate).toISOString();
      } else {
        updateData.endDate = goal.endDate;
      }

      const updatedGoal = await tx.goal.update({

        where: {
          id: goalId,
        },

        data: updateData,

      });

      await tx.timeline.create({

        data: {

          title: "Goal Updated",

          description: `${updatedGoal.title} updated.`,

          userId: updatedGoal.ownerId,

        },

      });

      return updatedGoal;

    });

  }

  // ====================================================
  // Delete Goal
  // ====================================================

  async deleteGoal(goalId) {

    return prisma.$transaction(async (tx) => {

      const goal = await tx.goal.findUnique({

        where: {
          id: goalId,
        },

      });

      if (!goal) {

        throw new Error("Goal not found.");

      }

      await tx.timeline.create({

        data: {

          title: "Goal Deleted",

          description: `${goal.title} deleted.`,

          userId: goal.ownerId,

        },

      });

      await tx.notification.create({

        data: {

          title: "Goal Deleted",

          message: `${goal.title} has been deleted.`,

          type: "GOAL",

          userId: goal.ownerId,

        },

      });

      await tx.goal.delete({

        where: {
          id: goalId,
        },

      });

      return true;

    });

  }
    // ====================================================
  // Update Progress
  // ====================================================

  async updateProgress(goalId, progress) {

    const jiraService = require("./jira.service");

    return prisma.$transaction(async (tx) => {

      const goal = await tx.goal.findUnique({
        where: {
          id: goalId,
        },
      });

      if (!goal) {
        throw new Error("Goal not found.");
      }

      if (goal.status === "REJECTED") {
        throw new Error("Rejected goal cannot be updated.");
      }

      const updatedGoal = await tx.goal.update({
        where: {
          id: goalId,
        },
        data: {
          progress,
          status: progress === 100 ? "COMPLETED" : goal.status,
        },
      });

      await tx.timeline.create({
        data: {
          title: "Progress Updated",
          description: `Progress updated to ${progress}%`,
          userId: goal.ownerId,
        },
      });

      await tx.notification.create({
        data: {
          title: "Goal Progress",
          message: `${updatedGoal.title} progress updated to ${progress}%`,
          type: "GOAL",
          userId: goal.ownerId,
        },
      });

      // Sync progress to Jira after transaction commits
      if (goal.jiraIssueKey) {
        setImmediate(async () => {
          try {
            await jiraService.updateTaskProgress(goal.jiraIssueKey, progress);
          } catch (error) {
            console.error("Failed to sync progress to Jira:", error.message);
          }
        });
      }

      return updatedGoal;

    });

  }

  // ====================================================
  // Approve Goal
  // ====================================================

  async approveGoal(goalId, managerId, comment) {

    const jiraService = require("./jira.service");

    return prisma.$transaction(async (tx) => {

      const goal = await tx.goal.findUnique({
        where: {
          id: goalId,
        },
        include: {
          owner: {
            select: {
              managerId: true,
              jiraAccountId: true,
            },
          },
        },
      });

      if (!goal) {
        throw new Error("Goal not found.");
      }

      // Verify manager owns this employee
      if (goal.owner.managerId !== managerId) {
        throw new Error("You are not authorized to approve this goal. This employee is not in your team.");
      }

      if (goal.status === "APPROVED") {
        throw new Error("Goal already approved.");
      }

      if (goal.status === "REJECTED") {
        throw new Error("Rejected goal cannot be approved.");
      }

      const updatedGoal = await tx.goal.update({

        where: {
          id: goalId,
        },

        data: {
          status: "APPROVED",
          approvedById: managerId,
        },

      });

      await tx.goalFeedback.create({

        data: {

          goalId,

          managerId,

          action: "APPROVED",

          comment,

        },

      });

      await tx.timeline.create({

        data: {

          title: "Goal Approved",

          description: `Goal "${updatedGoal.title}" approved.`,

          userId: updatedGoal.ownerId,

        },

      });

      await tx.notification.create({

        data: {

          title: "Goal Approved",

          message: `${updatedGoal.title} has been approved.`,

          type: "GOAL",

          userId: updatedGoal.ownerId,

        },

      });

      // Auto-create Jira task after transaction commits
      setImmediate(async () => {
        try {
          // Only create Jira task if not already created
          if (!updatedGoal.jiraIssueKey && goal.owner.jiraAccountId) {
            await jiraService.createTask({
              title: updatedGoal.title,
              description: updatedGoal.description,
              ownerId: updatedGoal.ownerId,
              goalId: updatedGoal.id,
            });
          }
        } catch (error) {
          console.error("Failed to create Jira task:", error.message);
        }
      });

      return updatedGoal;

    });

  }

  // ====================================================
  // Reject Goal
  // ====================================================

  async rejectGoal(goalId, managerId, comment) {

    return prisma.$transaction(async (tx) => {

      const goal = await tx.goal.findUnique({
        where: {
          id: goalId,
        },
        include: {
          owner: {
            select: {
              managerId: true,
            },
          },
        },
      });

      if (!goal) {
        throw new Error("Goal not found.");
      }

      // Verify manager owns this employee
      if (goal.owner.managerId !== managerId) {
        throw new Error("You are not authorized to reject this goal. This employee is not in your team.");
      }

      if (goal.status === "REJECTED") {
        throw new Error("Goal already rejected.");
      }

      const updatedGoal = await tx.goal.update({

        where: {
          id: goalId,
        },

        data: {
          status: "REJECTED",
        },

      });

      await tx.goalFeedback.create({

        data: {

          goalId,

          managerId,

          action: "REJECTED",

          comment,

        },

      });

      await tx.timeline.create({

        data: {

          title: "Goal Rejected",

          description: `Goal "${updatedGoal.title}" rejected.`,

          userId: updatedGoal.ownerId,

        },

      });

      await tx.notification.create({

        data: {

          title: "Goal Rejected",

          message: `${updatedGoal.title} has been rejected.`,

          type: "GOAL",

          userId: updatedGoal.ownerId,

        },

      });

      return updatedGoal;

    });

  }
    // ====================================================
  // Add Manager Feedback
  // ====================================================

  async addFeedback(goalId, managerId, comment) {

    return prisma.$transaction(async (tx) => {

      const goal = await tx.goal.findUnique({

        where: {
          id: goalId,
        },

        include: {
          owner: true,
        },

      });

      if (!goal) {
        throw new Error("Goal not found.");
      }

      // Manager ownership validation
      if (goal.owner.managerId !== managerId) {
        throw new Error(
          "You are not authorized to review this goal."
        );
      }

      const feedback = await tx.goalFeedback.create({

        data: {

          goalId,

          managerId,

          action: "FEEDBACK",

          comment,

        },

      });

      await tx.timeline.create({

        data: {

          title: "Manager Feedback",

          description: comment,

          userId: goal.ownerId,

        },

      });

      await tx.notification.create({

        data: {

          title: "Feedback Received",

          message: comment,

          type: "GOAL",

          userId: goal.ownerId,

        },

      });

      return feedback;

    });

  }

}

module.exports = new GoalService();