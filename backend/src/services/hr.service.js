const prisma = require("../config/prisma");

// ==========================================
// HR Dashboard
// ==========================================

exports.getDashboard = async () => {

  const [
    totalEmployees,
    totalManagers,
    totalHR,
    totalGoals,
    pendingGoals,
    approvedGoals,
    rejectedGoals,
    completedGoals,
    pendingReviews,
    completedReviews,
    avgProgressResult,
  ] = await Promise.all([

    prisma.user.count({ where: { role: "EMPLOYEE", isDeleted: false } }),
    prisma.user.count({ where: { role: "MANAGER", isDeleted: false } }),
    prisma.user.count({ where: { role: "HR", isDeleted: false } }),

    prisma.goal.count(),
    prisma.goal.count({ where: { status: "PENDING" } }),
    prisma.goal.count({ where: { status: "APPROVED" } }),
    prisma.goal.count({ where: { status: "REJECTED" } }),
    prisma.goal.count({ where: { status: "COMPLETED" } }),

    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "COMPLETED" } }),

    prisma.goal.aggregate({ _avg: { progress: true } }),

  ]);

  return {
    totalEmployees,
    totalManagers,
    totalHR,
    totalGoals,
    pendingGoals,
    approvedGoals,
    rejectedGoals,
    completedGoals,
    pendingReviews,
    completedReviews,
    averageProgress: Math.round(avgProgressResult._avg.progress || 0),
  };

};

// ==========================================
// Get All Users (Active Only)
// ==========================================

exports.getUsers = async () => {

  return prisma.user.findMany({

    where: {
      isDeleted: false, // Only active users
    },

    orderBy: { createdAt: "desc" },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      designation: true,
      managerId: true,
      createdAt: true,
      updatedAt: true,
    },

  });

};

// ==========================================
// Create User
// ==========================================

exports.createUser = async (data) => {

  const bcrypt = require("bcrypt");

  if (!data.name || !data.email || !data.password || !data.role) {
    throw new Error("Name, Email, Password and Role are required.");
  }

  const allowedRoles = ["EMPLOYEE", "MANAGER", "HR"];

  if (!allowedRoles.includes(data.role)) {
    throw new Error("Invalid role. Must be EMPLOYEE, MANAGER, or HR.");
  }

  const normalizedEmail = data.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new Error("Email already exists.");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      name: data.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: data.role,
      department: data.department || null,
      designation: data.designation || null,
      managerId: data.managerId || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      designation: true,
      managerId: true,
      createdAt: true,
    },
  });

};

// ==========================================
// Get Managers (Active Only)
// ==========================================

exports.getManagers = async () => {

  return prisma.user.findMany({

    where: { 
      role: "MANAGER",
      isDeleted: false, // Only active managers
    },

    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      designation: true,
    },

    orderBy: { name: "asc" },

  });

};

// ==========================================
// Get User By ID
// ==========================================

exports.getUserById = async (id) => {

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      designation: true,
      managerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;

};

// ==========================================
// Update User
// ==========================================

exports.updateUser = async (id, data) => {

  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("User not found.");
  }

  // Duplicate email validation
  if (
    data.email &&
    data.email.toLowerCase() !== existingUser.email
  ) {

    const emailExists = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (emailExists) {
      throw new Error("Email already exists.");
    }

  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: data.name ?? existingUser.name,
      email: data.email
        ? data.email.toLowerCase()
        : existingUser.email,
      department: data.department ?? existingUser.department,
      designation: data.designation ?? existingUser.designation,
      managerId: data.managerId ?? existingUser.managerId,
      role: data.role ?? existingUser.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      designation: true,
      managerId: true,
      updatedAt: true,
    },
  });

  return updatedUser;

};

// ==========================================
// Delete User (Soft Delete)
// ==========================================

exports.deleteUser = async (id, deletedByHrId) => {

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.isDeleted) {
    throw new Error("User is already archived.");
  }

  // Soft delete: Mark as deleted
  await prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: deletedByHrId || null,
    },
  });

  return {
    success: true,
    message: "User archived successfully. All historical data has been preserved.",
  };

};

// ==========================================
// Get Archived Users
// ==========================================

exports.getArchivedUsers = async () => {

  return prisma.user.findMany({

    where: {
      isDeleted: true, // Only archived users
    },

    orderBy: { deletedAt: "desc" },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      designation: true,
      managerId: true,
      createdAt: true,
      deletedAt: true,
      deletedBy: true,
    },

  });

};

// ==========================================
// Restore Archived User
// ==========================================

exports.restoreUser = async (id) => {

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.isDeleted) {
    throw new Error("User is not archived.");
  }

  // Restore user: Remove soft delete flags
  const restoredUser = await prisma.user.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      designation: true,
      managerId: true,
      createdAt: true,
    },
  });

  return {
    success: true,
    message: "User restored successfully.",
    data: restoredUser,
  };

};

// ==========================================
// Get All Goals (HR)
// ==========================================

exports.getAllGoals = async () => {

  return prisma.goal.findMany({

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
        orderBy: { createdAt: "desc" },
      },

    },

    orderBy: { createdAt: "desc" },

  });

};

// ==========================================
// Get All Reviews (HR)
// ==========================================

exports.getAllReviews = async () => {

  return prisma.review.findMany({

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          designation: true,
        },
      },
    },

    orderBy: { createdAt: "desc" },

  });

};
