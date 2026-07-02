const axios = require("axios");
const prisma = require("../config/prisma");

/**
 * Jira Integration Service
 * 
 * Enterprise-level integration with company-wide Jira workspace
 * All API calls use Jira Admin Service Account credentials
 * HR performs all operations without needing Jira admin access
 */

class JiraService {

  constructor() {
    this.baseURL = process.env.JIRA_BASE_URL;
    this.adminEmail = process.env.JIRA_ADMIN_EMAIL;
    this.apiToken = process.env.JIRA_API_TOKEN;
    this.projectKey = process.env.JIRA_PROJECT_KEY;

    // Create axios instance with auth
    this.jiraAPI = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      auth: {
        username: this.adminEmail,
        password: this.apiToken,
      },
      // Handle SSL certificate issues in development
      httpsAgent: process.env.NODE_ENV === 'development' ? 
        new (require('https').Agent)({ rejectUnauthorized: false }) : undefined,
    });
  }

  // ==========================================
  // Check if Jira is configured
  // ==========================================

  isConfigured() {
    return !!(
      this.baseURL &&
      this.adminEmail &&
      this.apiToken &&
      this.projectKey
    );
  }

  // ==========================================
  // Invite User to Jira Workspace
  // ==========================================

  async inviteUserToWorkspace(email, displayName) {
    try {
      if (!this.isConfigured()) {
        console.warn("Jira is not configured. Skipping invitation.");
        return { success: false, message: "Jira not configured" };
      }

      console.log(`[Jira] Attempting to invite user: ${email}`);

      // Check if user already exists in Jira
      const existingUser = await this.findUserByEmail(email);

      if (existingUser) {
        console.log(`[Jira] User ${email} already exists in Jira workspace with accountId: ${existingUser.accountId}`);
        return {
          success: true,
          accountId: existingUser.accountId,
          alreadyExists: true,
          message: "User already exists in workspace",
        };
      }

      console.log(`[Jira] User not found in workspace. Sending organization invitation to ${email}`);

      // For Jira Cloud, use organization invitation API
      // Note: This requires organization admin permissions
      const response = await this.jiraAPI.post("/rest/api/3/user", {
        emailAddress: email,
        displayName: displayName,
        notification: true, // Send invitation email
        products: ["jira-software"], // Grant access to Jira Software
      });

      console.log(`[Jira] Invitation sent successfully to ${email}, Account ID: ${response.data.accountId}`);

      return {
        success: true,
        accountId: response.data.accountId,
        alreadyExists: false,
        message: "Invitation sent successfully",
      };

    } catch (error) {
      console.error("[Jira] Invitation error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // Check if user already exists (409 conflict)
      if (error.response?.status === 409) {
        console.log(`[Jira] User ${email} might already exist (409 conflict). Checking...`);
        const existingUser = await this.findUserByEmail(email);
        if (existingUser) {
          console.log(`[Jira] Confirmed: User found with accountId: ${existingUser.accountId}`);
          return {
            success: true,
            accountId: existingUser.accountId,
            alreadyExists: true,
            message: "User already exists",
          };
        }
      }

      // Check if it's a permission error
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error("[Jira] Permission denied. Please check:");
        console.error("  1. API token is valid and not expired");
        console.error("  2. Admin account has 'Administer Jira' permission");
        console.error("  3. Organization allows user creation via API");
      }

      return {
        success: false,
        message: error.response?.data?.errorMessages?.[0] || error.response?.data?.message || error.message,
        error: error.response?.data,
      };
    }
  }

  // ==========================================
  // Find User by Email
  // ==========================================

  async findUserByEmail(email) {
    try {
      if (!this.isConfigured()) {
        return null;
      }

      const response = await this.jiraAPI.get("/rest/api/3/user/search", {
        params: {
          query: email,
        },
      });

      if (response.data && response.data.length > 0) {
        const user = response.data.find(u => u.emailAddress === email);
        return user || null;
      }

      return null;

    } catch (error) {
      console.error("Find user error:", error.message);
      return null;
    }
  }

  // ==========================================
  // Link Existing Jira Account
  // ==========================================

  async linkExistingAccount(userId, email) {
    try {
      if (!this.isConfigured()) {
        return { success: false };
      }

      const jiraUser = await this.findUserByEmail(email);

      if (!jiraUser) {
        return { success: false, message: "User not found in Jira" };
      }

      // Update PMS user with Jira account ID
      await prisma.user.update({
        where: { id: userId },
        data: {
          jiraAccountId: jiraUser.accountId,
          jiraInvited: true,
        },
      });

      return {
        success: true,
        accountId: jiraUser.accountId,
        message: "Account linked successfully",
      };

    } catch (error) {
      console.error("Link account error:", error.message);
      return { success: false, message: error.message };
    }
  }

  // ==========================================
  // Create Jira Task
  // ==========================================

  async createTask(goalData) {
    try {
      if (!this.isConfigured()) {
        console.warn("Jira not configured. Skipping task creation.");
        return { success: false, message: "Jira not configured" };
      }

      const { title, description, assigneeId, ownerId, goalId } = goalData;

      // Get employee's Jira account ID from database
      const employee = await prisma.user.findUnique({
        where: { id: ownerId },
        select: { jiraAccountId: true, email: true, name: true },
      });

      if (!employee?.jiraAccountId) {
        console.warn(`Employee ${ownerId} has no Jira account ID`);
        return {
          success: false,
          message: "Employee not linked to Jira account",
        };
      }

      // Create Jira issue
      const response = await this.jiraAPI.post("/rest/api/3/issue", {
        fields: {
          project: {
            key: this.projectKey,
          },
          summary: title,
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: description || title,
                  },
                ],
              },
            ],
          },
          issuetype: {
            name: "Task",
          },
          assignee: {
            accountId: employee.jiraAccountId,
          },
          labels: ["PMS", "Goal", `goal-${goalId}`],
        },
      });

      const issueKey = response.data.key;
      const issueUrl = `${this.baseURL}/browse/${issueKey}`;

      console.log(`Jira task created: ${issueKey}`);

      // Update goal with Jira info
      await prisma.goal.update({
        where: { id: goalId },
        data: {
          jiraIssueKey: issueKey,
          jiraIssueUrl: issueUrl,
          jiraStatus: "To Do",
          jiraSyncStatus: "SYNCED",
        },
      });

      // Create timeline entry
      await prisma.timeline.create({
        data: {
          title: "Jira Task Created",
          description: `Jira task ${issueKey} created and assigned`,
          userId: ownerId,
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          title: "Jira Task Created",
          message: `Your goal has been synced to Jira as task ${issueKey}`,
          type: "GOAL",
          userId: ownerId,
        },
      });

      return {
        success: true,
        issueKey,
        issueUrl,
        message: "Task created successfully",
      };

    } catch (error) {
      console.error("Create Jira task error:", error.response?.data || error.message);

      // Update goal sync status to FAILED
      if (goalData.goalId) {
        await prisma.goal.update({
          where: { id: goalData.goalId },
          data: {
            jiraSyncStatus: "FAILED",
          },
        });
      }

      return {
        success: false,
        message: error.response?.data?.errors || error.message,
      };
    }
  }

  // ==========================================
  // Update Jira Task Status
  // ==========================================

  async updateTaskProgress(issueKey, progress) {
    try {
      if (!this.isConfigured() || !issueKey) {
        return { success: false };
      }

      // Map progress to Jira status
      let transitionName = "To Do";

      if (progress === 0) {
        transitionName = "To Do";
      } else if (progress > 0 && progress < 50) {
        transitionName = "In Progress";
      } else if (progress >= 50 && progress < 100) {
        transitionName = "In Progress";
      } else if (progress === 100) {
        transitionName = "Done";
      }

      // Get available transitions
      const transitionsResponse = await this.jiraAPI.get(
        `/rest/api/3/issue/${issueKey}/transitions`
      );

      const transitions = transitionsResponse.data.transitions;
      const targetTransition = transitions.find(
        t => t.name === transitionName || t.to.name === transitionName
      );

      if (!targetTransition) {
        console.warn(`Transition to "${transitionName}" not found for ${issueKey}`);
        return { success: false, message: "Transition not found" };
      }

      // Perform transition
      await this.jiraAPI.post(`/rest/api/3/issue/${issueKey}/transitions`, {
        transition: {
          id: targetTransition.id,
        },
      });

      console.log(`Jira issue ${issueKey} transitioned to ${transitionName}`);

      return {
        success: true,
        status: transitionName,
        message: "Task updated successfully",
      };

    } catch (error) {
      console.error("Update Jira task error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ==========================================
  // Get Jira Task Details
  // ==========================================

  async getTaskDetails(issueKey) {
    try {
      if (!this.isConfigured() || !issueKey) {
        return { success: false };
      }

      const response = await this.jiraAPI.get(`/rest/api/3/issue/${issueKey}`, {
        params: {
          fields: "summary,status,assignee,created,updated",
        },
      });

      return {
        success: true,
        data: {
          key: response.data.key,
          summary: response.data.fields.summary,
          status: response.data.fields.status.name,
          assignee: response.data.fields.assignee?.displayName,
          created: response.data.fields.created,
          updated: response.data.fields.updated,
        },
      };

    } catch (error) {
      console.error("Get Jira task error:", error.message);
      return { success: false, message: error.message };
    }
  }

  // ==========================================
  // Sync Jira Status to PMS
  // ==========================================

  async syncStatusToPMS(issueKey, jiraStatus) {
    try {
      // Find goal by Jira issue key
      const goal = await prisma.goal.findFirst({
        where: { jiraIssueKey: issueKey },
        include: {
          owner: {
            select: { id: true, name: true },
          },
        },
      });

      if (!goal) {
        console.warn(`Goal not found for Jira issue ${issueKey}`);
        return { success: false, message: "Goal not found" };
      }

      // Map Jira status to PMS progress
      let progress = goal.progress;
      let goalStatus = goal.status;

      switch (jiraStatus.toLowerCase()) {
        case "to do":
          progress = 0;
          break;
        case "in progress":
          if (progress < 50) progress = 50;
          break;
        case "code review":
        case "in review":
          if (progress < 80) progress = 80;
          break;
        case "done":
          progress = 100;
          goalStatus = "COMPLETED";
          break;
      }

      // Update goal
      await prisma.goal.update({
        where: { id: goal.id },
        data: {
          progress,
          status: goalStatus,
          jiraStatus,
          jiraSyncStatus: "SYNCED",
        },
      });

      // Create timeline entry
      await prisma.timeline.create({
        data: {
          title: "Jira Status Synced",
          description: `Jira task ${issueKey} status changed to ${jiraStatus}`,
          userId: goal.ownerId,
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          title: "Goal Synced from Jira",
          message: `Your goal progress updated to ${progress}% based on Jira task ${issueKey}`,
          type: "GOAL",
          userId: goal.ownerId,
        },
      });

      console.log(`Synced Jira status ${jiraStatus} to PMS goal ${goal.id}`);

      return {
        success: true,
        message: "Status synced successfully",
      };

    } catch (error) {
      console.error("Sync status to PMS error:", error.message);
      return { success: false, message: error.message };
    }
  }

  // ==========================================
  // Sync All Goal Statuses
  // ==========================================

  async syncAllGoalStatuses() {
    try {
      if (!this.isConfigured()) {
        return { success: false, message: "Jira not configured" };
      }

      const goals = await prisma.goal.findMany({
        where: {
          jiraIssueKey: { not: null },
          status: { not: "COMPLETED" },
        },
      });

      let synced = 0;
      let failed = 0;

      for (const goal of goals) {
        const result = await this.getTaskDetails(goal.jiraIssueKey);

        if (result.success) {
          await this.syncStatusToPMS(goal.jiraIssueKey, result.data.status);
          synced++;
        } else {
          failed++;
        }
      }

      return {
        success: true,
        synced,
        failed,
        message: `Synced ${synced} goals, ${failed} failed`,
      };

    } catch (error) {
      console.error("Sync all statuses error:", error.message);
      return { success: false, message: error.message };
    }
  }

}

module.exports = new JiraService();
