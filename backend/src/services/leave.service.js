const prisma = require("../config/prisma");
const notificationService = require("./notification.service");
const timelineService = require("./timeline.service");

// ==========================================
// Employee - Create Leave Request
// ==========================================

exports.createLeaveRequest = async (employeeId, data) => {

  const { requestType, leaveType, startDate, endDate, reason } = data;

  if (!requestType || !startDate || !endDate || !reason) {
    throw new Error("Request Type, Start Date, End Date, and Reason are required.");
  }

  if (requestType === "LEAVE" && !leaveType) {
    throw new Error("Leave Type is required when requesting Leave.");
  }

  // Get employee details including manager
  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
    select: { id: true, name: true, managerId: true, manager: { select: { id: true, name: true } } },
  });

  if (!employee) {
    throw new Error("Employee not found.");
  }

  if (!employee.managerId) {
    throw new Error("You don't have an assigned manager. Please contact HR.");
  }

  // Create leave request
  const leaveRequest = await prisma.leaveRequest.create({
    data: {
      requestType,
      leaveType: requestType === "LEAVE" ? leaveType : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      employeeId,
      managerId: employee.managerId,
      status: "PENDING",
    },
    include: {
      employee: { select: { id: true, name: true, email: true } },
      manager: { select: { id: true, name: true, email: true } },
    },
  });

  // Send notification to manager
  await notificationService.create({
    userId: employee.managerId,
    title: `New ${requestType === "LEAVE" ? "Leave" : "WFH"} Request`,
    message: `${employee.name} has submitted a ${requestType === "LEAVE" ? "Leave" : "Work From Home"} request for your approval.`,
    type: "LEAVE",
  });

  // Create timeline entry for employee
  await timelineService.create({
    userId: employeeId,
    title: `${requestType === "LEAVE" ? "Leave" : "WFH"} Request Submitted`,
    description: `Submitted ${requestType === "LEAVE" ? "Leave" : "Work From Home"} request from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
  });

  return leaveRequest;

};

// ==========================================
// Employee - Get Own Leave Requests
// ==========================================

exports.getEmployeeLeaveRequests = async (employeeId) => {

  return prisma.leaveRequest.findMany({
    where: { employeeId },
    include: {
      manager: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

};

// ==========================================
// Manager - Get Team Leave Requests
// ==========================================

exports.getManagerLeaveRequests = async (managerId) => {

  return prisma.leaveRequest.findMany({
    where: { managerId },
    include: {
      employee: { select: { id: true, name: true, email: true, department: true, designation: true } },
    },
    orderBy: { createdAt: "desc" },
  });

};

// ==========================================
// Manager - Update Leave Request Status
// ==========================================

exports.updateLeaveRequestStatus = async (requestId, managerId, data) => {

  const { status, managerComment } = data;

  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
    throw new Error("Invalid status. Must be APPROVED or REJECTED.");
  }

  // Verify request exists and belongs to this manager
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: {
      employee: { select: { id: true, name: true } },
      manager: { select: { id: true, name: true } },
    },
  });

  if (!leaveRequest) {
    throw new Error("Leave request not found.");
  }

  if (leaveRequest.managerId !== managerId) {
    throw new Error("You are not authorized to manage this request.");
  }

  if (leaveRequest.status !== "PENDING") {
    throw new Error(`This request has already been ${leaveRequest.status.toLowerCase()}.`);
  }

  // Update leave request
  const updatedRequest = await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status,
      managerComment: managerComment || null,
    },
    include: {
      employee: { select: { id: true, name: true, email: true } },
      manager: { select: { id: true, name: true } },
    },
  });

  // Send notification to employee
  await notificationService.create({
    userId: leaveRequest.employeeId,
    title: `${leaveRequest.requestType === "LEAVE" ? "Leave" : "WFH"} Request ${status === "APPROVED" ? "Approved" : "Rejected"}`,
    message: `Your ${leaveRequest.requestType === "LEAVE" ? "Leave" : "Work From Home"} request has been ${status.toLowerCase()} by ${leaveRequest.manager.name}.${managerComment ? ` Comment: ${managerComment}` : ""}`,
    type: "LEAVE",
  });

  // Create timeline entry for employee
  await timelineService.create({
    userId: leaveRequest.employeeId,
    title: `${leaveRequest.requestType === "LEAVE" ? "Leave" : "WFH"} Request ${status === "APPROVED" ? "Approved" : "Rejected"}`,
    description: `${leaveRequest.requestType === "LEAVE" ? "Leave" : "Work From Home"} request ${status.toLowerCase()} by ${leaveRequest.manager.name}${managerComment ? ` - ${managerComment}` : ""}`,
  });

  return updatedRequest;

};

// ==========================================
// Get Leave Request By ID
// ==========================================

exports.getLeaveRequestById = async (requestId, userId, userRole) => {

  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: {
      employee: { select: { id: true, name: true, email: true, department: true, designation: true } },
      manager: { select: { id: true, name: true } },
    },
  });

  if (!leaveRequest) {
    throw new Error("Leave request not found.");
  }

  // Verify access (employee can see own requests, manager can see team requests)
  if (userRole === "EMPLOYEE" && leaveRequest.employeeId !== userId) {
    throw new Error("You are not authorized to view this request.");
  }

  if (userRole === "MANAGER" && leaveRequest.managerId !== userId) {
    throw new Error("You are not authorized to view this request.");
  }

  return leaveRequest;

};
