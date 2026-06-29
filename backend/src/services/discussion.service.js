const prisma = require("../config/prisma");
const notificationService = require("./notification.service");
const timelineService = require("./timeline.service");

class DiscussionService {

  // ==========================================
  // Create Discussion Comment
  // ==========================================

  async createComment(data) {

    const { goalId, userId, message } = data;

    if (!goalId || !userId || !message) {
      throw new Error("Goal ID, User ID, and Message are required.");
    }

    if (message.trim().length === 0) {
      throw new Error("Message cannot be empty.");
    }

    // Verify goal exists and get goal details
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            managerId: true,
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
            role: true,
          },
        },
      },
    });

    if (!goal) {
      throw new Error("Goal not found.");
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    // Verify user has access to this goal
    const isOwner = goal.ownerId === userId;
    const isManager = goal.owner.managerId === userId;
    const isCreator = goal.createdById === userId;

    if (!isOwner && !isManager && !isCreator) {
      throw new Error("You do not have access to discuss this goal.");
    }

    // Create discussion comment
    const comment = await prisma.goalDiscussion.create({
      data: {
        message: message.trim(),
        goalId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Send notifications
    if (user.role === "EMPLOYEE") {
      // Employee commented - notify manager
      if (goal.owner.managerId) {
        await notificationService.create({
          userId: goal.owner.managerId,
          title: "New Goal Discussion Comment",
          message: `${user.name} commented on goal: "${goal.title}"`,
          type: "GOAL",
        });
      }

      // Create timeline entry for employee
      await timelineService.create({
        userId: goal.ownerId,
        title: "Goal Discussion",
        description: `You commented on goal: "${goal.title}"`,
      });

    } else if (user.role === "MANAGER") {
      // Manager replied - notify employee
      await notificationService.create({
        userId: goal.ownerId,
        title: "Manager Replied to Discussion",
        message: `${user.name} replied to your goal discussion: "${goal.title}"`,
        type: "GOAL",
      });

      // Create timeline entry for employee
      await timelineService.create({
        userId: goal.ownerId,
        title: "Manager Reply",
        description: `${user.name} replied to discussion on goal: "${goal.title}"`,
      });
    }

    return comment;

  }

  // ==========================================
  // Get All Comments for a Goal
  // ==========================================

  async getGoalComments(goalId, userId) {

    if (!goalId || !userId) {
      throw new Error("Goal ID and User ID are required.");
    }

    // Verify goal exists
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      select: {
        id: true,
        title: true,
        ownerId: true,
        owner: {
          select: {
            id: true,
            managerId: true,
          },
        },
      },
    });

    if (!goal) {
      throw new Error("Goal not found.");
    }

    // Verify user has access to this goal
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    const isOwner = goal.ownerId === userId;
    const isManager = goal.owner.managerId === userId;
    const isHR = user.role === "HR";

    if (!isOwner && !isManager && !isHR) {
      throw new Error("You do not have access to view this discussion.");
    }

    // Get all comments for this goal
    const comments = await prisma.goalDiscussion.findMany({
      where: { goalId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return comments;

  }

  // ==========================================
  // Update Comment (Edit)
  // ==========================================

  async updateComment(commentId, userId, message) {

    if (!commentId || !userId || !message) {
      throw new Error("Comment ID, User ID, and Message are required.");
    }

    if (message.trim().length === 0) {
      throw new Error("Message cannot be empty.");
    }

    // Verify comment exists
    const comment = await prisma.goalDiscussion.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!comment) {
      throw new Error("Comment not found.");
    }

    // Verify user owns this comment
    if (comment.userId !== userId) {
      throw new Error("You can only edit your own comments.");
    }

    // Update comment
    const updatedComment = await prisma.goalDiscussion.update({
      where: { id: commentId },
      data: {
        message: message.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return updatedComment;

  }

  // ==========================================
  // Delete Comment
  // ==========================================

  async deleteComment(commentId, userId) {

    if (!commentId || !userId) {
      throw new Error("Comment ID and User ID are required.");
    }

    // Verify comment exists
    const comment = await prisma.goalDiscussion.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!comment) {
      throw new Error("Comment not found.");
    }

    // Verify user owns this comment
    if (comment.userId !== userId) {
      throw new Error("You can only delete your own comments.");
    }

    // Delete comment
    await prisma.goalDiscussion.delete({
      where: { id: commentId },
    });

    return {
      success: true,
      message: "Comment deleted successfully.",
    };

  }

  // ==========================================
  // Get Comment by ID
  // ==========================================

  async getCommentById(commentId, userId) {

    if (!commentId || !userId) {
      throw new Error("Comment ID and User ID are required.");
    }

    const comment = await prisma.goalDiscussion.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        goal: {
          select: {
            id: true,
            title: true,
            ownerId: true,
            owner: {
              select: {
                managerId: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      throw new Error("Comment not found.");
    }

    // Verify user has access
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isOwner = comment.goal.ownerId === userId;
    const isManager = comment.goal.owner.managerId === userId;
    const isHR = user.role === "HR";

    if (!isOwner && !isManager && !isHR) {
      throw new Error("You do not have access to view this comment.");
    }

    return comment;

  }

}

module.exports = new DiscussionService();
