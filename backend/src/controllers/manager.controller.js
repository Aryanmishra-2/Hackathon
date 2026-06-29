const goalService = require("../services/goal.service");
const managerService = require("../services/manager.service");
const reviewService = require("../services/review.service");
const employeeService = require("../services/employee.service");
const prisma = require("../config/prisma");

// ==========================================
// Dashboard
// ==========================================

exports.dashboard = async (req, res) => {
  try {

    const data = await managerService.getDashboard(req.user.id);

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};

// ==========================================
// Team Members
// ==========================================

exports.getTeam = async (req, res) => {
  try {

    const team = await managerService.getTeam(req.user.id);

    return res.status(200).json({
      success: true,
      total: team.length,
      data: team,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};

// ==========================================
// Create Goal (Manager assigns to team member)
// ==========================================

exports.createGoal = async (req, res) => {
  try {

    const { title, description, ownerId, startDate, endDate } = req.body;

    // Verify that ownerId is a team member
    const employee = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Verify manager owns this employee
    if (employee.managerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only assign goals to your team members.",
      });
    }

    const goal = await goalService.createGoal({
      title,
      description,
      ownerId,
      createdById: req.user.id, // Manager creates the goal
      startDate,
      endDate,
    });

    return res.status(201).json({
      success: true,
      message: "Goal created and assigned successfully.",
      data: goal,
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Give Quick Rating to Team Member
// ==========================================

exports.giveRating = async (req, res) => {
  try {

    const { employeeId } = req.params;
    const { rating, feedback } = req.body;
    const managerId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // Verify employee belongs to manager's team
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    if (employee.managerId !== managerId) {
      return res.status(403).json({
        success: false,
        message: "You can only rate your own team members.",
      });
    }

    // Create or update review
    const review = await reviewService.createReview({
      userId: employeeId,
      rating: Number(rating),
      feedback: feedback || "Quick rating from manager",
    });

    // Update review status to COMPLETED
    await reviewService.submitReview(review.id, {
      rating: Number(rating),
      feedback: feedback || "Quick rating from manager",
    });

    // Create notification for employee
    await prisma.notification.create({
      data: {
        title: "New Rating Received",
        message: `Your manager has given you ${rating} star${rating > 1 ? 's' : ''} rating!`,
        type: "REVIEW",
        userId: employeeId,
      },
    });

    // Create timeline entry
    await prisma.timeline.create({
      data: {
        title: "Rating Received",
        description: `Manager rated you ${rating}/5 stars`,
        userId: employeeId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Rating submitted successfully.",
      data: review,
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to submit rating.",
    });

  }
};

// ==========================================
// Remove Employee from Team
// ==========================================

exports.removeFromTeam = async (req, res) => {
  try {

    const { employeeId } = req.params;
    const managerId = req.user.id;

    // Verify employee belongs to manager's team
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    if (employee.managerId !== managerId) {
      return res.status(403).json({
        success: false,
        message: "You can only remove employees from your own team.",
      });
    }

    // Remove manager-employee relationship (unassign)
    await prisma.user.update({
      where: { id: employeeId },
      data: {
        managerId: null,
      },
    });

    // Create notification for employee
    await prisma.notification.create({
      data: {
        title: "Team Change",
        message: "You have been removed from your manager's team.",
        type: "SYSTEM",
        userId: employeeId,
      },
    });

    // Create timeline entry
    await prisma.timeline.create({
      data: {
        title: "Team Change",
        description: "Removed from manager's team",
        userId: employeeId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Employee removed from team successfully.",
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to remove employee from team.",
    });

  }
};

// ==========================================
// All Team Goals
// ==========================================

exports.getGoals = async (req, res) => {
  try {

    const goals = await goalService.getManagerGoals(req.user.id);

    return res.status(200).json({
      success: true,
      total: goals.length,
      data: goals,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};

// ==========================================
// Pending Goals
// ==========================================

exports.getPendingGoals = async (req, res) => {
  try {

    const goals = await managerService.getPendingGoals(req.user.id);

    return res.status(200).json({
      success: true,
      total: goals.length,
      data: goals,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};

// ==========================================
// Goal Details
// ==========================================

exports.getGoal = async (req, res) => {
  try {

    const goal = await goalService.getGoalById(req.params.id);

    return res.status(200).json({
      success: true,
      data: goal,
    });

  } catch (error) {

    console.error(error);

    return res.status(404).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Approve Goal
// ==========================================

exports.approveGoal = async (req, res) => {
  try {

    const { comment } = req.body;

    const goal = await goalService.approveGoal(
      req.params.id,
      req.user.id,
      comment || ""
    );

    return res.status(200).json({
      success: true,
      message: "Goal approved successfully.",
      data: goal,
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Reject Goal
// ==========================================

exports.rejectGoal = async (req, res) => {
  try {

    const { comment } = req.body;

    const goal = await goalService.rejectGoal(
      req.params.id,
      req.user.id,
      comment || ""
    );

    return res.status(200).json({
      success: true,
      message: "Goal rejected successfully.",
      data: goal,
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Add Feedback
// ==========================================

exports.addFeedback = async (req, res) => {
  try {

    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Feedback comment is required.",
      });
    }

    const feedback = await goalService.addFeedback(
      req.params.id,
      req.user.id,
      comment
    );

    return res.status(201).json({
      success: true,
      message: "Feedback added successfully.",
      data: feedback,
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Delete Goal (Manager can delete team member goals)
// ==========================================

exports.deleteGoal = async (req, res) => {
  try {

    const goalId = req.params.id;
    const managerId = req.user.id;

    // Verify goal exists and manager owns the employee
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        owner: {
          select: {
            managerId: true,
          },
        },
      },
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    // Verify manager owns this employee
    if (goal.owner.managerId !== managerId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete goals of your team members.",
      });
    }

    await goalService.deleteGoal(goalId);

    return res.status(200).json({
      success: true,
      message: "Goal deleted successfully.",
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Team Reviews
// ==========================================

exports.getReviews = async (req, res) => {
  try {

    const reviews = await reviewService.getManagerReviews(req.user.id);

    return res.status(200).json({
      success: true,
      total: reviews.length,
      data: reviews,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};

// ==========================================
// Submit Review
// ==========================================

exports.submitReview = async (req, res) => {
  try {

    const review = await reviewService.submitReview(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Review submitted successfully.",
      data: review,
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Manager Notifications
// ==========================================

exports.getNotifications = async (req, res) => {

  try {

    const notifications =
      await employeeService.getNotifications(req.user.id);

    return res.status(200).json({

      success: true,

      total: notifications.length,

      data: notifications,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================================
// Mark Single Notification As Read
// ==========================================

exports.markNotification = async (req, res) => {

  try {

    await employeeService.markNotification(req.params.id);

    return res.status(200).json({

      success: true,

      message: "Notification marked as read.",

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================================
// Mark All Notifications
// ==========================================

exports.markAllNotifications = async (req, res) => {

  try {

    await employeeService.markAllNotifications(req.user.id);

    return res.status(200).json({

      success: true,

      message: "All notifications marked as read.",

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================================
// Manager Timeline
// ==========================================

exports.getTimeline = async (req, res) => {

  try {

    const timeline = await employeeService.getTimeline(req.user.id);

    return res.status(200).json({

      success: true,

      total: timeline.length,

      data: timeline,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};
