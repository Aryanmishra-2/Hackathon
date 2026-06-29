const hrService = require("../services/hr.service");
const reportService = require("../services/report.service");

// ==========================================
// Dashboard
// ==========================================

exports.dashboard = async (req, res) => {
  try {

    const dashboard = await hrService.getDashboard();

    return res.status(200).json({
      success: true,
      data: dashboard,
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
// Create User
// ==========================================

exports.createUser = async (req, res) => {
  try {

    const user = await hrService.createUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: user,
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
// Get All Users
// ==========================================

exports.getUsers = async (req, res) => {
  try {

    const users = await hrService.getUsers();

    return res.status(200).json({
      success: true,
      data: users,
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
// Get User By Id
// ==========================================

exports.getUserById = async (req, res) => {
  try {

    const user = await hrService.getUserById(req.params.id);

    return res.status(200).json({
      success: true,
      data: user,
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
// Update User
// ==========================================

exports.updateUser = async (req, res) => {
  try {

    const user = await hrService.updateUser(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: user,
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
// Delete User (Soft Delete / Archive)
// ==========================================

exports.deleteUser = async (req, res) => {
  try {

    const hrId = req.user.id; // Get logged-in HR ID

    const result = await hrService.deleteUser(req.params.id, hrId);

    return res.status(200).json(result);

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Get Archived Users
// ==========================================

exports.getArchivedUsers = async (req, res) => {
  try {

    const archivedUsers = await hrService.getArchivedUsers();

    return res.status(200).json({
      success: true,
      data: archivedUsers,
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
// Restore Archived User
// ==========================================

exports.restoreUser = async (req, res) => {
  try {

    const result = await hrService.restoreUser(req.params.id);

    return res.status(200).json(result);

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Get Managers
// ==========================================

exports.getManagers = async (req, res) => {
  try {

    const managers = await hrService.getManagers();

    return res.status(200).json({
      success: true,
      data: managers,
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
// Get All Goals (HR)
// ==========================================

exports.getGoals = async (req, res) => {
  try {

    const goals = await hrService.getAllGoals();

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
// Get All Reviews (HR)
// ==========================================

exports.getReviews = async (req, res) => {
  try {

    const { reviewCycle, reviewYear, reviewMonth, employeeName } = req.query;

    const filters = {
      reviewCycle,
      reviewYear,
      reviewMonth,
      employeeName,
    };

    const reviews = await hrService.getAllReviews(filters);

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
// Download Employee Performance Report (PDF) - HR Access
// ==========================================

exports.downloadEmployeeReport = async (req, res) => {

  try {

    const { employeeId } = req.params;

    // HR can download any employee's report
    // Verify employee exists
    const prisma = require("../config/prisma");
    
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      select: { name: true, role: true },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Generate PDF using the existing report service
    const pdfBuffer = await reportService.generateEmployeeReportForHR(employeeId);

    const filename = `Performance_Report_${employee.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

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

    console.error("HR Report Generation Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to generate report.",
    });

  }

};
