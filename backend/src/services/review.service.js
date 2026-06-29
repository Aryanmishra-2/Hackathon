const prisma = require("../config/prisma");

class ReviewService {

  // ==========================================
  // Employee Reviews
  // ==========================================

  async getEmployeeReviews(userId) {

    return prisma.review.findMany({

      where: {
        userId,
      },

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

      orderBy: {
        createdAt: "desc",
      },

    });

  }

  // ==========================================
  // Manager Reviews
  // ==========================================

  async getManagerReviews(managerId) {

    return prisma.review.findMany({

      where: {
        user: {
          managerId,
        },
      },

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

      orderBy: {
        createdAt: "desc",
      },

    });

  }

  // ==========================================
  // Get Review By Id
  // ==========================================

  async getReviewById(reviewId) {

    const review = await prisma.review.findUnique({

      where: {
        id: reviewId,
      },

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

    });

    if (!review) {

      throw new Error("Review not found.");

    }

    return review;

  }

  // ==========================================
  // Create Review
  // ==========================================

  async createReview(data) {

    const { userId, reviewCycle, reviewMonth, reviewYear } = data;

    // Validate review cycle data
    if (!reviewCycle || !["MONTHLY", "YEARLY"].includes(reviewCycle)) {
      throw new Error("Invalid review cycle. Must be MONTHLY or YEARLY.");
    }

    if (!reviewYear) {
      throw new Error("Review year is required.");
    }

    if (reviewCycle === "MONTHLY") {
      if (!reviewMonth || reviewMonth < 1 || reviewMonth > 12) {
        throw new Error("Valid review month (1-12) is required for monthly reviews.");
      }

      // Check if a review already exists for this month/year/user
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          reviewCycle: "MONTHLY",
          reviewMonth,
          reviewYear,
        },
      });

      if (existingReview) {
        throw new Error(`A review already exists for this employee for ${this.getMonthName(reviewMonth)} ${reviewYear}.`);
      }
    } else if (reviewCycle === "YEARLY") {
      // Check if a review already exists for this year/user
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          reviewCycle: "YEARLY",
          reviewYear,
        },
      });

      if (existingReview) {
        throw new Error(`An annual review already exists for this employee for ${reviewYear}.`);
      }
    }

    const review = await prisma.review.create({

      data: {

        userId,

        reviewCycle,

        reviewMonth: reviewCycle === "MONTHLY" ? reviewMonth : null,

        reviewYear,

        feedback: data.feedback || null,

        rating: data.rating || null,

        status: "PENDING",

      },

      include: {
        user: true,
      },

    });

    return review;

  }

  // Helper: Get month name
  getMonthName(month) {
    const months = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];
    return months[month - 1] || "Unknown";
  }

  // ==========================================
  // Submit Review
  // ==========================================

  async submitReview(reviewId, data) {

    const review = await prisma.review.findUnique({

      where: {
        id: reviewId,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            designation: true,
            managerId: true,
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },

    });

    if (!review) {

      throw new Error("Review not found.");

    }

    // Prepare update data
    const updateData = {
      rating: data.rating,
      feedback: data.feedback,
      status: "COMPLETED",
    };

    // If AI data is provided, store it
    if (data.aiData) {
      updateData.aiRating = data.aiData.rating;
      updateData.aiPerformanceSummary = data.aiData.performanceSummary;
      updateData.aiStrengths = JSON.stringify(data.aiData.strengths || []);
      updateData.aiAreasForImprovement = JSON.stringify(data.aiData.areasForImprovement || []);
      updateData.aiRecommendations = JSON.stringify(data.aiData.recommendations || []);
    }

    const updatedReview = await prisma.review.update({

      where: {
        id: reviewId,
      },

      data: updateData,

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            designation: true,
            managerId: true,
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },

    });

    // ==========================================
    // Generate PDF Report and Send Emails
    // ==========================================

    try {
      console.log("📄 Starting PDF generation and email sending...");

      const reportService = require("./report.service");
      const emailService = require("./email.service");

      // Generate PDF report for the employee
      console.log(`📄 Generating PDF for employee: ${review.userId}`);
      const pdfBuffer = await reportService.generateEmployeeReportForSelf(review.userId);
      console.log("✅ PDF generated successfully");

      // Get review period label
      const reviewPeriod = this.getReviewPeriodLabel(updatedReview);
      console.log(`📅 Review period: ${reviewPeriod}`);

      // Email subject
      const subject = `Performance Review Report - ${reviewPeriod}`;

      // Send email to Employee
      console.log(`📧 Sending email to Employee: ${updatedReview.user.email}`);
      try {
        const employeeEmailResult = await emailService.sendPerformanceReportEmail(
          updatedReview.user.email,
          subject,
          updatedReview.user.name,
          reviewPeriod,
          pdfBuffer
        );

        if (employeeEmailResult.success) {
          console.log(`✅ Performance report emailed to Employee: ${updatedReview.user.email}`);
        } else {
          console.warn(`⚠️  Email to Employee failed: ${employeeEmailResult.error}`);
        }
      } catch (emailError) {
        console.error("❌ Failed to send email to Employee:", emailError.message);
      }

      // Get HR email (first HR user found)
      const hrUser = await prisma.user.findFirst({
        where: { role: "HR" },
        select: { email: true, name: true },
      });

      if (hrUser && hrUser.email) {
        console.log(`📧 Sending email to HR: ${hrUser.email}`);
        try {
          const hrEmailResult = await emailService.sendPerformanceReportEmail(
            hrUser.email,
            subject,
            updatedReview.user.name,
            reviewPeriod,
            pdfBuffer
          );

          if (hrEmailResult.success) {
            console.log(`✅ Performance report emailed to HR: ${hrUser.email}`);
          } else {
            console.warn(`⚠️  Email to HR failed: ${hrEmailResult.error}`);
          }
        } catch (emailError) {
          console.error("❌ Failed to send email to HR:", emailError.message);
        }
      } else {
        console.warn("⚠️  No HR user found. Skipping HR email.");
      }

      console.log("✅ PDF generation and email process completed");

    } catch (reportError) {
      console.error("❌ Failed to generate report or send emails:", reportError.message);
      console.error("❌ Error stack:", reportError.stack);
      // Continue without failing the review submission
    }

    return updatedReview;

  }

  // Helper: Get review period label
  getReviewPeriodLabel(review) {
    if (review.reviewCycle === "MONTHLY" && review.reviewMonth) {
      const months = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
      return `${months[review.reviewMonth - 1]} ${review.reviewYear}`;
    } else if (review.reviewCycle === "YEARLY") {
      return `Year ${review.reviewYear}`;
    }
    return new Date(review.createdAt).toLocaleDateString();
  }

  // ==========================================
  // Get All Reviews (HR) with filters
  // ==========================================

  async getAllReviews(filters = {}) {

    const where = {};

    // Filter by review cycle
    if (filters.reviewCycle && ["MONTHLY", "YEARLY"].includes(filters.reviewCycle)) {
      where.reviewCycle = filters.reviewCycle;
    }

    // Filter by year
    if (filters.reviewYear) {
      where.reviewYear = parseInt(filters.reviewYear);
    }

    // Filter by month (only for MONTHLY reviews)
    if (filters.reviewMonth && filters.reviewCycle === "MONTHLY") {
      where.reviewMonth = parseInt(filters.reviewMonth);
    }

    // Filter by employee name
    if (filters.employeeName) {
      where.user = {
        name: {
          contains: filters.employeeName,
        },
      };
    }

    return prisma.review.findMany({

      where,

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

      orderBy: [
        { reviewYear: "desc" },
        { reviewMonth: "desc" },
        { createdAt: "desc" },
      ],

    });

  }

  // ==========================================
  // Review Statistics
  // ==========================================

  async getReviewStats() {

    const totalReviews = await prisma.review.count();

    const pendingReviews = await prisma.review.count({

      where: {
        status: "PENDING",
      },

    });

    const completedReviews = await prisma.review.count({

      where: {
        status: "COMPLETED",
      },

    });

    const averageRating = await prisma.review.aggregate({

      _avg: {

        rating: true,

      },

    });

    return {

      totalReviews,

      pendingReviews,

      completedReviews,

      averageRating:
        Number(
          averageRating._avg.rating || 0
        ).toFixed(1),

    };

  }

}

module.exports = new ReviewService();