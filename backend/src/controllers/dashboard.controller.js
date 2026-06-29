const dashboardService = require("../services/dashboard.service");

// ==========================================
// Dashboard
// ==========================================

exports.getDashboard = async (req, res) => {

  try {

    let dashboard;

    switch (req.user.role) {

      case "EMPLOYEE":

        dashboard = await dashboardService.employeeDashboard(
          req.user.id
        );

        break;

      case "MANAGER":

        dashboard = await dashboardService.managerDashboard(
          req.user.id
        );

        break;

      case "HR":

        dashboard = await dashboardService.hrDashboard();

        break;

      default:

        return res.status(403).json({
          success: false,
          message: "Access Denied",
        });

    }

    return res.status(200).json({

      success: true,

      role: req.user.role,

      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },

      dashboard,

    });

  } catch (error) {

    console.error("Dashboard Error :", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard.",
      error: error.message,
    });

  }

};