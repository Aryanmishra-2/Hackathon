const leaveService = require("../services/leave.service");

// ==========================================
// Employee - Create Leave Request
// ==========================================

exports.createLeaveRequest = async (req, res) => {
  try {

    const employeeId = req.user.id;

    const leaveRequest = await leaveService.createLeaveRequest(employeeId, req.body);

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully.",
      data: leaveRequest,
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
// Employee - Get Own Leave Requests
// ==========================================

exports.getEmployeeLeaveRequests = async (req, res) => {
  try {

    const employeeId = req.user.id;

    const leaveRequests = await leaveService.getEmployeeLeaveRequests(employeeId);

    return res.status(200).json({
      success: true,
      total: leaveRequests.length,
      data: leaveRequests,
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
// Manager - Get Team Leave Requests
// ==========================================

exports.getManagerLeaveRequests = async (req, res) => {
  try {

    const managerId = req.user.id;

    const leaveRequests = await leaveService.getManagerLeaveRequests(managerId);

    return res.status(200).json({
      success: true,
      total: leaveRequests.length,
      data: leaveRequests,
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
// Manager - Update Leave Request Status
// ==========================================

exports.updateLeaveRequestStatus = async (req, res) => {
  try {

    const { requestId } = req.params;
    const managerId = req.user.id;

    const leaveRequest = await leaveService.updateLeaveRequestStatus(requestId, managerId, req.body);

    return res.status(200).json({
      success: true,
      message: "Leave request updated successfully.",
      data: leaveRequest,
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
// Get Leave Request By ID
// ==========================================

exports.getLeaveRequestById = async (req, res) => {
  try {

    const { requestId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const leaveRequest = await leaveService.getLeaveRequestById(requestId, userId, userRole);

    return res.status(200).json({
      success: true,
      data: leaveRequest,
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};
