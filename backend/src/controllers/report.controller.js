const reportService = require("../services/report.service");

// ==========================================
// Generate Employee Performance Report (PDF)
// ==========================================

exports.generateEmployeeReport = async (req, res) => {

  try {

    const { employeeId } = req.params;

    const managerId = req.user.id;

    // Generate PDF buffer
    const pdfBuffer = await reportService.generateEmployeeReport(
      employeeId,
      managerId
    );

    // Get employee name for filename
    const prisma = require("../config/prisma");

    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      select: { name: true },
    });

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

    console.error("Report Generation Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to generate report.",
    });

  }

};

// ==========================================
// Get Team Members List (for report selection)
// ==========================================

exports.getTeamForReports = async (req, res) => {

  try {

    const prisma = require("../config/prisma");

    const managerId = req.user.id;

    const team = await prisma.user.findMany({
      where: {
        managerId,
        role: "EMPLOYEE",
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
