const jiraService = require("../services/jira.service");

/**
 * Jira Webhook Controller
 * 
 * Handles incoming webhooks from Jira for two-way synchronization
 * When Jira issue status changes, automatically updates PMS goal
 */

// ==========================================
// Jira Webhook Handler
// ==========================================

exports.handleWebhook = async (req, res) => {
  try {
    const webhookEvent = req.body;

    console.log("Jira webhook received:", webhookEvent.webhookEvent);

    // Handle issue updated event
    if (webhookEvent.webhookEvent === "jira:issue_updated") {
      const issue = webhookEvent.issue;
      const issueKey = issue.key;
      const status = issue.fields.status.name;

      console.log(`Jira issue ${issueKey} status changed to: ${status}`);

      // Sync status to PMS
      await jiraService.syncStatusToPMS(issueKey, status);

      return res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
      });
    }

    // Handle other events if needed
    return res.status(200).json({
      success: true,
      message: "Event acknowledged",
    });

  } catch (error) {
    console.error("Jira webhook error:", error.message);

    // Always return 200 to Jira to prevent retries
    return res.status(200).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Manual Sync Endpoint (for testing/recovery)
// ==========================================

exports.manualSync = async (req, res) => {
  try {
    const result = await jiraService.syncAllGoalStatuses();

    return res.status(200).json({
      success: true,
      data: result,
      message: "Manual sync completed",
    });

  } catch (error) {
    console.error("Manual sync error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Jira Task Details
// ==========================================

exports.getTaskDetails = async (req, res) => {
  try {
    const { issueKey } = req.params;

    const result = await jiraService.getTaskDetails(issueKey);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message || "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });

  } catch (error) {
    console.error("Get task details error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
