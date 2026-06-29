const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

const prisma = require("../config/prisma");

class AIService {
  constructor() {
    // Initialize Bedrock client
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.modelId =
      process.env.BEDROCK_MODEL_ID ||
      "anthropic.claude-3-5-sonnet-20241022-v2:0";
    
    console.log(`AI Service initialized with model: ${this.modelId}`);
  }

  // ==========================================
  // Fetch Employee Performance Data (with review cycle filter)
  // ==========================================

  async fetchEmployeePerformanceData(employeeId, managerId, reviewPeriod = {}) {
    try {
      // Verify that the employee belongs to the manager
      const employee = await prisma.user.findUnique({
        where: { id: employeeId },
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          designation: true,
          managerId: true,
        },
      });

      if (!employee) {
        throw new Error("Employee not found.");
      }

      if (employee.managerId !== managerId) {
        throw new Error("Unauthorized: Employee not in your team.");
      }

      // Calculate date range based on review cycle
      const { startDate, endDate } = this.getReviewPeriodRange(reviewPeriod);

      // Fetch Goals (filtered by review period)
      const goals = await prisma.goal.findMany({
        where: {
          ownerId: employeeId,
          OR: [
            {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            {
              updatedAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          progress: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Fetch Goal Feedback (filtered by review period)
      const goalFeedback = await prisma.goalFeedback.findMany({
        where: {
          goal: {
            ownerId: employeeId,
          },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          action: true,
          comment: true,
          createdAt: true,
          goal: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Fetch Timeline (filtered by review period)
      const timeline = await prisma.timeline.findMany({
        where: {
          userId: employeeId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50, // Limit to last 50 entries
      });

      // Fetch Previous Reviews (all previous reviews for context)
      const previousReviews = await prisma.review.findMany({
        where: {
          userId: employeeId,
          status: "COMPLETED",
        },
        select: {
          id: true,
          rating: true,
          feedback: true,
          reviewCycle: true,
          reviewMonth: true,
          reviewYear: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5, // Last 5 reviews
      });

      return {
        employee,
        goals,
        goalFeedback,
        timeline,
        previousReviews,
        reviewPeriod,
      };
    } catch (error) {
      console.error("Error fetching employee performance data:", error);
      throw error;
    }
  }

  // ==========================================
  // Get Review Period Date Range
  // ==========================================

  getReviewPeriodRange(reviewPeriod) {
    const { reviewCycle, reviewMonth, reviewYear } = reviewPeriod;

    let startDate, endDate;

    if (reviewCycle === "MONTHLY" && reviewMonth && reviewYear) {
      // Monthly review: Filter data for specific month
      startDate = new Date(reviewYear, reviewMonth - 1, 1);
      endDate = new Date(reviewYear, reviewMonth, 0, 23, 59, 59, 999);
    } else if (reviewCycle === "YEARLY" && reviewYear) {
      // Yearly review: Filter data for entire year
      startDate = new Date(reviewYear, 0, 1);
      endDate = new Date(reviewYear, 11, 31, 23, 59, 59, 999);
    } else {
      // Default: Last 12 months
      endDate = new Date();
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    return { startDate, endDate };
  }

  // ==========================================
  // Generate AI Performance Review
  // ==========================================

  async generatePerformanceReview(employeeId, managerId, reviewPeriod = {}) {
    try {
      // Fetch employee performance data
      const performanceData = await this.fetchEmployeePerformanceData(
        employeeId,
        managerId,
        reviewPeriod
      );

      const { employee, goals, goalFeedback, timeline, previousReviews } =
        performanceData;

      // Calculate statistics
      const totalGoals = goals.length;
      const completedGoals = goals.filter((g) => g.status === "COMPLETED")
        .length;
      const inProgressGoals = goals.filter((g) => g.status === "APPROVED")
        .length;
      const pendingGoals = goals.filter((g) => g.status === "PENDING").length;
      const rejectedGoals = goals.filter((g) => g.status === "REJECTED").length;

      const averageProgress =
        totalGoals > 0
          ? goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) /
            totalGoals
          : 0;

      const previousAverageRating =
        previousReviews.length > 0
          ? previousReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            previousReviews.length
          : null;

      // Build review period description
      const periodDescription = this.getReviewPeriodDescription(reviewPeriod);

      // Prepare prompt for Claude
      const prompt = this.buildPrompt(
        employee,
        goals,
        goalFeedback,
        timeline,
        previousReviews,
        {
          totalGoals,
          completedGoals,
          inProgressGoals,
          pendingGoals,
          rejectedGoals,
          averageProgress,
          previousAverageRating,
        },
        periodDescription
      );

      // Call Amazon Bedrock
      const response = await this.invokeBedrockModel(prompt);

      return {
        success: true,
        data: response,
        performanceData: {
          employee,
          stats: {
            totalGoals,
            completedGoals,
            inProgressGoals,
            pendingGoals,
            rejectedGoals,
            averageProgress: averageProgress.toFixed(1),
            previousAverageRating: previousAverageRating?.toFixed(1),
          },
        },
      };
    } catch (error) {
      console.error("Error generating AI performance review:", error);
      throw error;
    }
  }

  // ==========================================
  // Get Review Period Description
  // ==========================================

  getReviewPeriodDescription(reviewPeriod) {
    const { reviewCycle, reviewMonth, reviewYear } = reviewPeriod;

    if (reviewCycle === "MONTHLY" && reviewMonth && reviewYear) {
      const monthNames = ["January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"];
      return `${monthNames[reviewMonth - 1]} ${reviewYear}`;
    } else if (reviewCycle === "YEARLY" && reviewYear) {
      return `Year ${reviewYear}`;
    }
    return "All Time";
  }

  // ==========================================
  // Build Prompt for Claude
  // ==========================================

  buildPrompt(
    employee,
    goals,
    goalFeedback,
    timeline,
    previousReviews,
    stats,
    periodDescription
  ) {
    return `You are an expert HR performance analyst. Analyze the following employee performance data and generate a comprehensive performance review for the period: ${periodDescription}.

**REVIEW PERIOD:** ${periodDescription}

**EMPLOYEE INFORMATION:**
- Name: ${employee.name}
- Department: ${employee.department || "N/A"}
- Designation: ${employee.designation || "N/A"}

**PERFORMANCE STATISTICS (for ${periodDescription}):**
- Total Goals: ${stats.totalGoals}
- Completed Goals: ${stats.completedGoals}
- In Progress Goals: ${stats.inProgressGoals}
- Pending Approval: ${stats.pendingGoals}
- Rejected Goals: ${stats.rejectedGoals}
- Average Progress: ${stats.averageProgress.toFixed(1)}%
${stats.previousAverageRating ? `- Previous Average Rating: ${stats.previousAverageRating}/5` : ""}

**GOALS (during ${periodDescription}):**
${
  goals.length > 0
    ? goals
        .map(
          (g, idx) => `${idx + 1}. "${g.title}"
   Description: ${g.description || "N/A"}
   Status: ${g.status}
   Progress: ${g.progress}%
   Timeline: ${new Date(g.startDate).toLocaleDateString()} - ${new Date(g.endDate).toLocaleDateString()}
`
        )
        .join("\n")
    : "No goals assigned during this period."
}

**MANAGER FEEDBACK (during ${periodDescription}):**
${
  goalFeedback.length > 0
    ? goalFeedback
        .map(
          (f, idx) => `${idx + 1}. [${f.action}] "${f.goal.title}"
   Comments: ${f.comment || "No comments"}
   Date: ${new Date(f.createdAt).toLocaleDateString()}
`
        )
        .join("\n")
    : "No feedback available during this period."
}

**RECENT TIMELINE ACTIVITIES (during ${periodDescription}):**
${
  timeline.length > 0
    ? timeline
        .slice(0, 10)
        .map(
          (t, idx) => `${idx + 1}. ${t.title}
   Description: ${t.description}
   Date: ${new Date(t.createdAt).toLocaleDateString()}
`
        )
        .join("\n")
    : "No timeline data during this period."
}

**PREVIOUS REVIEWS:**
${
  previousReviews.length > 0
    ? previousReviews
        .map(
          (r, idx) => `${idx + 1}. Rating: ${r.rating}/5
   Review Period: ${r.reviewCycle === "MONTHLY" ? `${this.getMonthName(r.reviewMonth)} ${r.reviewYear}` : `Year ${r.reviewYear}`}
   Feedback: ${r.feedback || "No feedback"}
   Date: ${new Date(r.createdAt).toLocaleDateString()}
`
        )
        .join("\n")
    : "No previous reviews."
}

**TASK:**
Based on the above data for the period ${periodDescription}, generate a comprehensive performance review in JSON format with the following structure:

{
  "rating": <number 1-5>,
  "performanceSummary": "<2-3 sentences summarizing overall performance for this period>",
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>"
  ],
  "areasForImprovement": [
    "<area 1>",
    "<area 2>",
    "<area 3>"
  ],
  "recommendations": [
    "<recommendation 1>",
    "<recommendation 2>",
    "<recommendation 3>"
  ]
}

**GUIDELINES:**
- Focus ONLY on the performance during ${periodDescription}
- Be objective and data-driven
- Consider goal completion rate, progress, and timeline adherence for this period
- Factor in manager feedback and previous ratings
- Provide specific, actionable recommendations
- Ensure the rating (1-5) reflects the overall performance accurately for this specific period
- Keep it professional and constructive
- Return ONLY valid JSON, no additional text`;
  }

  // Helper: Get month name
  getMonthName(month) {
    if (!month) return "Unknown";
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    return months[month - 1] || "Unknown";
  }

  // ==========================================
  // Invoke Bedrock Model
  // ==========================================

  async invokeBedrockModel(prompt) {
    try {
      console.log(`Using model: ${this.modelId}`);
      
      // Amazon Nova format (no anthropic_version)
      const payload = {
        messages: [
          {
            role: "user",
            content: [
              {
                text: prompt
              }
            ]
          }
        ],
        inferenceConfig: {
          maxTokens: 4096,
          temperature: 0.7
        }
      };

      console.log('Payload:', JSON.stringify(payload, null, 2));

      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
      });

      const response = await this.client.send(command);

      // Parse response
      const responseBody = JSON.parse(
        new TextDecoder().decode(response.body)
      );

      console.log('Response body:', JSON.stringify(responseBody, null, 2));

      // Amazon Nova response format
      if (!responseBody.output || !responseBody.output.message || !responseBody.output.message.content || !responseBody.output.message.content[0]) {
        throw new Error("Invalid response from Bedrock Nova");
      }
      
      const responseText = responseBody.output.message.content[0].text;

      // Extract JSON from response
      let jsonResponse;
      try {
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[1]);
        } else {
          jsonResponse = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.error("Response text:", responseText);
        throw new Error("Failed to parse AI response as JSON");
      }

      // Validate response structure
      if (
        !jsonResponse.rating ||
        !jsonResponse.performanceSummary ||
        !jsonResponse.strengths ||
        !jsonResponse.areasForImprovement ||
        !jsonResponse.recommendations
      ) {
        throw new Error("AI response missing required fields");
      }

      return jsonResponse;
    } catch (error) {
      console.error("Error invoking Bedrock model:", error);
      throw new Error(
        `Failed to generate AI review: ${error.message}`
      );
    }
  }
}

module.exports = new AIService();
