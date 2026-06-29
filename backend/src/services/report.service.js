const prisma = require("../config/prisma");
const PDFDocument = require("pdfkit");

class ReportService {

  // ==========================================
  // Generate Employee Performance Report
  // ==========================================

  async generateEmployeeReport(employeeId, managerId) {

    try {

      // Fetch employee data
      const employee = await prisma.user.findUnique({
        where: { id: employeeId },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!employee) {
        throw new Error("Employee not found.");
      }

      // Verify manager authorization
      if (employee.managerId !== managerId) {
        throw new Error("You are not authorized to generate this report.");
      }

      // Fetch goals
      const goals = await prisma.goal.findMany({
        where: { ownerId: employeeId },
        include: {
          feedbacks: {
            include: {
              manager: {
                select: { name: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Fetch reviews (including AI data)
      const reviews = await prisma.review.findMany({
        where: { userId: employeeId },
        orderBy: { createdAt: "desc" },
      });

      // Fetch timeline
      const timeline = await prisma.timeline.findMany({
        where: { userId: employeeId },
        orderBy: { createdAt: "desc" },
        take: 15,
      });

      // Calculate statistics
      const stats = this.calculateStats(goals, reviews);

      // Generate PDF
      const pdfBuffer = await this.createPDF({
        employee,
        goals,
        reviews,
        timeline,
        stats,
      });

      return pdfBuffer;

    } catch (error) {

      console.error("Report Generation Error:", error);
      throw error;

    }

  }

  // ==========================================
  // Calculate Performance Statistics
  // ==========================================

  calculateStats(goals, reviews) {

    const totalGoals = goals.length;
    const pendingGoals = goals.filter((g) => g.status === "PENDING").length;
    const approvedGoals = goals.filter((g) => g.status === "APPROVED").length;
    const rejectedGoals = goals.filter((g) => g.status === "REJECTED").length;
    const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;

    const avgProgress = totalGoals > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
      : 0;

    const completionRate = totalGoals > 0
      ? Math.round((completedGoals / totalGoals) * 100)
      : 0;

    const totalReviews = reviews.length;
    const completedReviews = reviews.filter((r) => r.status === "COMPLETED").length;

    const avgRating = completedReviews > 0
      ? (reviews
          .filter((r) => r.rating)
          .reduce((sum, r) => sum + r.rating, 0) / completedReviews
        ).toFixed(1)
      : 0;

    return {
      totalGoals,
      pendingGoals,
      approvedGoals,
      rejectedGoals,
      completedGoals,
      avgProgress,
      completionRate,
      totalReviews,
      completedReviews,
      avgRating,
    };

  }

  // ==========================================
  // Create PDF Document
  // ==========================================

  async createPDF(data) {

    return new Promise((resolve, reject) => {

      try {

        const doc = new PDFDocument({ 
          margin: 50,
          size: 'A4',
          bufferPages: true
        });

        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));

        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });

        doc.on("error", reject);

        // ==========================================
        // HEADER
        // ==========================================

        doc
          .fontSize(26)
          .fillColor("#2563eb")
          .font("Helvetica-Bold")
          .text("PERFORMANCE REPORT", { align: "center" });

        doc.moveDown(0.3);

        doc
          .fontSize(10)
          .fillColor("#6b7280")
          .font("Helvetica")
          .text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`, {
            align: "center",
          });

        doc.moveDown(0.8);

        this.addDivider(doc);

        doc.moveDown(0.8);

        // ==========================================
        // EMPLOYEE INFORMATION
        // ==========================================

        this.addSectionHeader(doc, "EMPLOYEE INFORMATION");

        doc.fontSize(11).fillColor("#374151").font("Helvetica");

        this.addInfoRow(doc, "Name:", data.employee.name);
        this.addInfoRow(doc, "Email:", data.employee.email);
        this.addInfoRow(doc, "Department:", data.employee.department || "—");
        this.addInfoRow(doc, "Designation:", data.employee.designation || "—");
        this.addInfoRow(doc, "Manager:", data.employee.manager?.name || "—");
        this.addInfoRow(doc, "Report Date:", new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));

        doc.moveDown(1);

        // ==========================================
        // PERFORMANCE SUMMARY
        // ==========================================

        this.addSectionHeader(doc, "PERFORMANCE SUMMARY");

        doc.fontSize(11).fillColor("#374151").font("Helvetica");

        this.addInfoRow(doc, "Total Goals:", data.stats.totalGoals.toString());
        this.addInfoRow(doc, "Completed Goals:", `${data.stats.completedGoals} (${data.stats.completionRate}%)`);
        this.addInfoRow(doc, "Approved Goals:", data.stats.approvedGoals.toString());
        this.addInfoRow(doc, "Pending Goals:", data.stats.pendingGoals.toString());
        this.addInfoRow(doc, "Rejected Goals:", data.stats.rejectedGoals.toString());
        this.addInfoRow(doc, "Average Progress:", `${data.stats.avgProgress}%`);

        doc.moveDown(0.5);

        this.addInfoRow(doc, "Total Reviews:", data.stats.totalReviews.toString());
        this.addInfoRow(doc, "Completed Reviews:", data.stats.completedReviews.toString());
        this.addInfoRow(doc, "Average Rating:", `${data.stats.avgRating} / 5.0`);

        doc.moveDown(1);

        // ==========================================
        // AI-GENERATED PERFORMANCE REVIEW
        // ==========================================

        // Find the most recent completed review with AI data
        const latestAIReview = data.reviews.find(r => 
          r.status === "COMPLETED" && r.aiPerformanceSummary
        );

        if (latestAIReview) {
          
          this.checkPageBreak(doc, 250);

          // AI Review Header
          doc
            .fontSize(18)
            .fillColor("#667eea")
            .font("Helvetica-Bold")
            .text("AI-GENERATED PERFORMANCE REVIEW", { underline: true });

          doc.moveDown(0.3);

          doc
            .fontSize(9)
            .fillColor("#9ca3af")
            .font("Helvetica-Oblique")
            .text(`Review Date: ${new Date(latestAIReview.updatedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} | Status: ${latestAIReview.status}`);

          doc.moveDown(0.8);

          // AI Rating
          doc
            .fontSize(13)
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .text("Overall AI Rating:", { continued: true });

          doc
            .fontSize(16)
            .fillColor("#667eea")
            .font("Helvetica-Bold")
            .text(` ${latestAIReview.aiRating}/5 ${"★".repeat(latestAIReview.aiRating || 0)}`);

          doc.moveDown(0.8);

          // Performance Summary
          doc
            .fontSize(13)
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .text("Performance Summary");

          doc.moveDown(0.3);

          doc
            .fontSize(10)
            .fillColor("#374151")
            .font("Helvetica")
            .text(latestAIReview.aiPerformanceSummary || "No summary available", {
              align: "justify",
              lineGap: 3
            });

          doc.moveDown(0.8);

          this.checkPageBreak(doc, 150);

          // Strengths
          doc
            .fontSize(13)
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .text("Key Strengths");

          doc.moveDown(0.3);

          const strengths = latestAIReview.aiStrengths 
            ? JSON.parse(latestAIReview.aiStrengths) 
            : [];

          if (strengths.length > 0) {
            strengths.forEach((strength, index) => {
              doc
                .fontSize(10)
                .fillColor("#16a34a")
                .font("Helvetica")
                .text(`${index + 1}. `, { continued: true, indent: 10 });
              
              doc
                .fillColor("#374151")
                .text(strength, {
                  align: "left",
                  indent: 0,
                  lineGap: 2
                });
              
              doc.moveDown(0.3);
            });
          } else {
            doc
              .fontSize(10)
              .fillColor("#6b7280")
              .font("Helvetica-Oblique")
              .text("No strengths identified", { indent: 10 });
          }

          doc.moveDown(0.8);

          this.checkPageBreak(doc, 150);

          // Areas for Improvement
          doc
            .fontSize(13)
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .text("Areas for Improvement");

          doc.moveDown(0.3);

          const improvements = latestAIReview.aiAreasForImprovement 
            ? JSON.parse(latestAIReview.aiAreasForImprovement) 
            : [];

          if (improvements.length > 0) {
            improvements.forEach((area, index) => {
              doc
                .fontSize(10)
                .fillColor("#dc2626")
                .font("Helvetica")
                .text(`${index + 1}. `, { continued: true, indent: 10 });
              
              doc
                .fillColor("#374151")
                .text(area, {
                  align: "left",
                  indent: 0,
                  lineGap: 2
                });
              
              doc.moveDown(0.3);
            });
          } else {
            doc
              .fontSize(10)
              .fillColor("#6b7280")
              .font("Helvetica-Oblique")
              .text("No areas identified", { indent: 10 });
          }

          doc.moveDown(0.8);

          this.checkPageBreak(doc, 150);

          // Recommendations
          doc
            .fontSize(13)
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .text("AI Recommendations");

          doc.moveDown(0.3);

          const recommendations = latestAIReview.aiRecommendations 
            ? JSON.parse(latestAIReview.aiRecommendations) 
            : [];

          if (recommendations.length > 0) {
            recommendations.forEach((rec, index) => {
              doc
                .fontSize(10)
                .fillColor("#2563eb")
                .font("Helvetica")
                .text(`${index + 1}. `, { continued: true, indent: 10 });
              
              doc
                .fillColor("#374151")
                .text(rec, {
                  align: "left",
                  indent: 0,
                  lineGap: 2
                });
              
              doc.moveDown(0.3);
            });
          } else {
            doc
              .fontSize(10)
              .fillColor("#6b7280")
              .font("Helvetica-Oblique")
              .text("No recommendations available", { indent: 10 });
          }

          doc.moveDown(0.8);

          // Final Manager Review
          this.checkPageBreak(doc, 100);

          doc
            .fontSize(13)
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .text("Manager's Final Review");

          doc.moveDown(0.3);

          doc
            .fontSize(10)
            .fillColor("#374151")
            .font("Helvetica")
            .text(`Rating: ${latestAIReview.rating}/5 ${"★".repeat(latestAIReview.rating || 0)}`);

          doc.moveDown(0.3);

          doc
            .fontSize(10)
            .fillColor("#374151")
            .font("Helvetica")
            .text("Feedback:", { continued: false });

          doc
            .fontSize(10)
            .fillColor("#374151")
            .font("Helvetica")
            .text(latestAIReview.feedback || "No feedback provided", {
              align: "justify",
              lineGap: 3,
              indent: 10
            });

          doc.moveDown(1.5);

        } else {
          
          this.checkPageBreak(doc, 80);
          
          doc
            .fontSize(10)
            .fillColor("#9ca3af")
            .font("Helvetica-Oblique")
            .text("No AI-generated review available yet. AI reviews are generated when managers submit performance reviews.");

          doc.moveDown(1);
        }

        // ==========================================
        // GOAL DETAILS
        // ==========================================

        this.checkPageBreak(doc, 150);

        this.addSectionHeader(doc, "GOAL DETAILS");

        if (data.goals.length === 0) {

          doc
            .fontSize(10)
            .fillColor("#6b7280")
            .font("Helvetica-Oblique")
            .text("No goals found.");

        } else {

          data.goals.forEach((goal, index) => {

            this.checkPageBreak(doc, 120);

            doc
              .fontSize(12)
              .fillColor("#111827")
              .font("Helvetica-Bold")
              .text(`${index + 1}. ${goal.title}`);

            doc.moveDown(0.2);

            doc
              .fontSize(9)
              .fillColor("#6b7280")
              .font("Helvetica")
              .text(`Description: ${goal.description || "No description"}`, {
                indent: 15,
                align: "justify"
              });

            doc.moveDown(0.2);

            // Status
            const statusColor = this.getStatusColor(goal.status);
            doc
              .fontSize(9)
              .fillColor(statusColor)
              .font("Helvetica-Bold")
              .text(`Status: ${goal.status}`, { indent: 15, continued: true });

            doc
              .fontSize(9)
              .fillColor("#6b7280")
              .font("Helvetica")
              .text(` | Progress: ${goal.progress}%`, { continued: false });

            doc
              .fontSize(9)
              .fillColor("#6b7280")
              .font("Helvetica")
              .text(
                `Timeline: ${new Date(goal.startDate).toLocaleDateString()} - ${new Date(goal.endDate).toLocaleDateString()}`,
                { indent: 15 }
              );

            // Manager feedback
            if (goal.feedbacks.length > 0) {
              doc.moveDown(0.2);
              doc
                .fontSize(9)
                .fillColor("#374151")
                .font("Helvetica-Bold")
                .text("Manager Feedback:", { indent: 15 });

              goal.feedbacks.slice(0, 2).forEach((feedback) => {
                doc
                  .fontSize(9)
                  .fillColor("#6b7280")
                  .font("Helvetica")
                  .text(
                    `- [${feedback.action}] ${feedback.comment}`,
                    { indent: 25, align: "justify" }
                  );
              });
            }

            doc.moveDown(0.6);

          });

        }

        doc.moveDown(0.5);

        // ==========================================
        // PREVIOUS REVIEWS
        // ==========================================

        this.checkPageBreak(doc, 150);

        this.addSectionHeader(doc, "PREVIOUS REVIEWS");

        const previousReviews = data.reviews.filter(r => r.status === "COMPLETED");

        if (previousReviews.length === 0) {

          doc
            .fontSize(10)
            .fillColor("#6b7280")
            .font("Helvetica-Oblique")
            .text("No previous reviews found.");

        } else {

          previousReviews.slice(0, 5).forEach((review, index) => {

            this.checkPageBreak(doc, 80);

            doc
              .fontSize(11)
              .fillColor("#111827")
              .font("Helvetica-Bold")
              .text(
                `Review #${index + 1} - ${new Date(review.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}`
              );

            doc.moveDown(0.2);

            doc
              .fontSize(10)
              .fillColor("#374151")
              .font("Helvetica")
              .text(`Rating: ${review.rating || "N/A"} / 5 ${"★".repeat(review.rating || 0)}`, { indent: 10 });

            if (review.feedback) {
              doc.moveDown(0.2);
              doc
                .fontSize(9)
                .fillColor("#6b7280")
                .font("Helvetica")
                .text(`Feedback: ${review.feedback}`, {
                  indent: 10,
                  align: "justify"
                });
            }

            doc.moveDown(0.5);

          });

          if (previousReviews.length > 5) {
            doc
              .fontSize(9)
              .fillColor("#9ca3af")
              .font("Helvetica-Oblique")
              .text(`... and ${previousReviews.length - 5} more review(s)`);
          }

        }

        doc.moveDown(0.8);

        // ==========================================
        // TIMELINE ACTIVITIES
        // ==========================================

        this.checkPageBreak(doc, 150);

        this.addSectionHeader(doc, "RECENT TIMELINE ACTIVITIES");

        if (data.timeline.length === 0) {

          doc
            .fontSize(10)
            .fillColor("#6b7280")
            .font("Helvetica-Oblique")
            .text("No recent activity.");

        } else {

          data.timeline.forEach((item) => {

            this.checkPageBreak(doc, 50);

            doc
              .fontSize(9)
              .fillColor("#111827")
              .font("Helvetica-Bold")
              .text(
                `${new Date(item.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })} - ${item.title}`,
                { indent: 5 }
              );

            doc
              .fontSize(9)
              .fillColor("#6b7280")
              .font("Helvetica")
              .text(`${item.description}`, { indent: 15 });

            doc.moveDown(0.3);

          });

        }

        doc.moveDown(2);

        // ==========================================
        // FOOTER
        // ==========================================

        this.addDivider(doc);

        doc.moveDown(0.5);

        doc
          .fontSize(9)
          .fillColor("#9ca3af")
          .font("Helvetica-Oblique")
          .text(
            "This is an automatically generated report. For questions or clarifications, contact HR.",
            { align: "center" }
          );

        doc
          .fontSize(8)
          .fillColor("#d1d5db")
          .font("Helvetica")
          .text("Performance Management System © 2026", { align: "center" });

        // Add page numbers
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          doc
            .fontSize(8)
            .fillColor("#9ca3af")
            .text(
              `Page ${i + 1} of ${pages.count}`,
              50,
              doc.page.height - 30,
              { align: "center" }
            );
        }

        // Finalize PDF
        doc.end();

      } catch (error) {

        reject(error);

      }

    });

  }

  // ==========================================
  // Helper: Check Page Break
  // ==========================================

  checkPageBreak(doc, requiredSpace) {
    if (doc.y + requiredSpace > doc.page.height - 70) {
      doc.addPage();
    }
  }

  // ==========================================
  // Helper: Add Section Header
  // ==========================================

  addSectionHeader(doc, title) {
    doc
      .fontSize(16)
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .text(title, { underline: true });

    doc.moveDown(0.5);
  }

  // ==========================================
  // Helper: Add Divider
  // ==========================================

  addDivider(doc) {
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .stroke();
  }

  // ==========================================
  // Helper: Add Info Row
  // ==========================================

  addInfoRow(doc, label, value) {

    doc
      .font("Helvetica-Bold")
      .fillColor("#374151")
      .text(label, { continued: true, width: 140 });

    doc
      .font("Helvetica")
      .fillColor("#111827")
      .text(value);

  }

  // ==========================================
  // Helper: Get Status Color
  // ==========================================

  getStatusColor(status) {
    const colors = {
      PENDING: "#f59e0b",
      APPROVED: "#16a34a",
      REJECTED: "#dc2626",
      COMPLETED: "#2563eb"
    };
    return colors[status] || "#6b7280";
  }



 // ==========================================
 // Generate Employee Report For Self (Employee Access)
  // ==========================================

  async generateEmployeeReportForSelf(employeeId) {

    try {

      // Fetch employee data
      const employee = await prisma.user.findUnique({
        where: { id: employeeId },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!employee) {
        throw new Error("Employee not found.");
      }

      // Fetch goals
      const goals = await prisma.goal.findMany({
        where: { ownerId: employeeId },
        include: {
          feedbacks: {
            include: {
              manager: {
                select: { name: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Fetch reviews (including AI data)
      const reviews = await prisma.review.findMany({
        where: { userId: employeeId },
        orderBy: { createdAt: "desc" },
      });

      // Fetch timeline
      const timeline = await prisma.timeline.findMany({
        where: { userId: employeeId },
        orderBy: { createdAt: "desc" },
        take: 15,
      });

      // Calculate statistics
      const stats = this.calculateStats(goals, reviews);

      // Generate PDF
      const pdfBuffer = await this.createPDF({
        employee,
        goals,
        reviews,
        timeline,
        stats,
      });

      return pdfBuffer;

    } catch (error) {

      console.error("Employee Self-Report Generation Error:", error);
      throw error;

    }

  }

  // ==========================================
  // Generate Employee Report For HR (HR Access)
  // ==========================================

  async generateEmployeeReportForHR(employeeId) {

    try {

      // Fetch employee data
      const employee = await prisma.user.findUnique({
        where: { id: employeeId },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!employee) {
        throw new Error("Employee not found.");
      }

      // HR can access any employee's report
      // Fetch goals
      const goals = await prisma.goal.findMany({
        where: { ownerId: employeeId },
        include: {
          feedbacks: {
            include: {
              manager: {
                select: { name: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Fetch reviews (including AI data)
      const reviews = await prisma.review.findMany({
        where: { userId: employeeId },
        orderBy: { createdAt: "desc" },
      });

      // Fetch timeline
      const timeline = await prisma.timeline.findMany({
        where: { userId: employeeId },
        orderBy: { createdAt: "desc" },
        take: 15,
      });

      // Calculate statistics
      const stats = this.calculateStats(goals, reviews);

      // Generate PDF
      const pdfBuffer = await this.createPDF({
        employee,
        goals,
        reviews,
        timeline,
        stats,
      });

      return pdfBuffer;

    } catch (error) {

      console.error("HR Report Generation Error:", error);
      throw error;

    }

  }

}

module.exports = new ReportService();

