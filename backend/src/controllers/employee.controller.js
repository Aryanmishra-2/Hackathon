const employeeService = require("../services/employee.service");
const goalService = require("../services/goal.service");
const reportService = require("../services/report.service");

// ==========================================
// Dashboard
// ==========================================

exports.dashboard = async (req, res) => {

  try {

    const data = await employeeService.getDashboard(req.user.id);

    return res.status(200).json({
      success: true,
      data,
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
// Profile
// ==========================================

exports.profile = async (req, res) => {

  try {

    const profile = await employeeService.getProfile(req.user.id);

    return res.status(200).json({
      success: true,
      data: profile,
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
// My Goals
// ==========================================

exports.getGoals = async (req, res) => {

  try {

    const goals = await goalService.getEmployeeGoals(req.user.id);

    return res.status(200).json({
      success: true,
      total: goals.length,
      data: goals,
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
// Create Goal
// ==========================================

exports.createGoal = async (req, res) => {

  try {

    const {
      title,
      description,
      startDate,
      endDate,
    } = req.body;

    const goal = await goalService.createGoal({

      title,
      description,

      ownerId: req.user.id,

      createdById: req.user.id,

      startDate: new Date(startDate),

      endDate: new Date(endDate),

    });

    return res.status(201).json({

      success: true,

      message: "Goal created successfully.",

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
// Reviews
// ==========================================

exports.getReviews = async (req, res) => {

  try {

    const reviews = await employeeService.getReviews(req.user.id);

    return res.status(200).json({

      success: true,

      total: reviews.length,

      data: reviews,

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
// Timeline
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
// ==========================================
// Get Goal Details
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
// Update Goal
// ==========================================

exports.updateGoal = async (req, res) => {

  try {

    const goal = await goalService.updateGoal(
      req.params.id,
      req.body
    );

    return res.status(200).json({

      success: true,

      message: "Goal updated successfully.",

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
// Delete Goal
// ==========================================

exports.deleteGoal = async (req, res) => {

  try {

    await goalService.deleteGoal(req.params.id);

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
// Update Progress
// ==========================================

exports.updateProgress = async (req, res) => {

  try {

    const { progress } = req.body;

    if (progress === undefined) {

      return res.status(400).json({

        success: false,

        message: "Progress is required.",

      });

    }

    const goal = await goalService.updateProgress(
      req.params.id,
      Number(progress)
    );

    return res.status(200).json({

      success: true,

      message: "Progress updated successfully.",

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
// Notifications
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
// Download My Performance Report (PDF)
// ==========================================

exports.downloadMyReport = async (req, res) => {

  try {

    const employeeId = req.user.id;

    // Employee can only download their own report
    // Generate PDF using the existing report service
    const pdfBuffer = await reportService.generateEmployeeReportForSelf(employeeId);

    // Get employee name for filename
    const prisma = require("../config/prisma");

    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      select: { name: true },
    });

    const filename = `My_Performance_Report_${employee.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

  } catch (error) {

    console.error("Employee Report Generation Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to generate report.",
    });

  }

};
