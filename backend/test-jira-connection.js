require("dotenv").config();
const axios = require("axios");

const baseURL = process.env.JIRA_BASE_URL;
const adminEmail = process.env.JIRA_ADMIN_EMAIL;
const apiToken = process.env.JIRA_API_TOKEN;
const projectKey = process.env.JIRA_PROJECT_KEY;

console.log("\n========================================");
console.log("JIRA CONNECTION TEST");
console.log("========================================\n");

console.log("Configuration:");
console.log(`  Base URL: ${baseURL}`);
console.log(`  Admin Email: ${adminEmail}`);
console.log(`  API Token: ${apiToken ? apiToken.substring(0, 20) + "..." : "NOT SET"}`);
console.log(`  Project Key: ${projectKey}\n`);

const jiraAPI = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  auth: {
    username: adminEmail,
    password: apiToken,
  },
});

async function testConnection() {
  try {
    console.log("Test 1: Get current user info...");
    const userResponse = await jiraAPI.get("/rest/api/3/myself");
    console.log("✓ SUCCESS - Connected as:", userResponse.data.displayName);
    console.log(`  Account ID: ${userResponse.data.accountId}`);
    console.log(`  Email: ${userResponse.data.emailAddress}\n`);

    console.log("Test 2: Check project access...");
    const projectResponse = await jiraAPI.get(`/rest/api/3/project/${projectKey}`);
    console.log("✓ SUCCESS - Project found:", projectResponse.data.name);
    console.log(`  Key: ${projectResponse.data.key}`);
    console.log(`  ID: ${projectResponse.data.id}\n`);

    console.log("Test 3: Get permissions...");
    const permissionsResponse = await jiraAPI.get(`/rest/api/3/mypermissions?projectKey=${projectKey}`);
    console.log("✓ SUCCESS - Permissions:");
    console.log(`  Add User: ${permissionsResponse.data.permissions?.["ADMINISTER"]?.havePermission ? "YES" : "NO"}`);
    console.log(`  Create Issues: ${permissionsResponse.data.permissions?.["CREATE_ISSUES"]?.havePermission ? "YES" : "NO"}`);
    console.log(`  Assign Issues: ${permissionsResponse.data.permissions?.["ASSIGN_ISSUES"]?.havePermission ? "YES" : "NO"}\n`);

    console.log("Test 4: Test user search API...");
    const searchResponse = await jiraAPI.get("/rest/api/3/user/search", {
      params: { query: adminEmail },
    });
    console.log(`✓ SUCCESS - Found ${searchResponse.data.length} users\n`);

    console.log("========================================");
    console.log("ALL TESTS PASSED ✓");
    console.log("========================================\n");
    console.log("NOTE: Jira Cloud may require Organization Admin");
    console.log("permissions to invite new users. If invitation");
    console.log("fails, please:");
    console.log("  1. Go to admin.atlassian.com");
    console.log("  2. Select your organization");
    console.log("  3. Go to Users → Invite users");
    console.log("  4. Manually invite the user\n");

  } catch (error) {
    console.error("\n✗ ERROR:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
    console.log("\nTroubleshooting:");
    console.log("  1. Verify API token is valid");
    console.log("  2. Check admin email has correct permissions");
    console.log("  3. Ensure Jira Cloud instance is accessible");
    console.log("  4. Visit: https://id.atlassian.com/manage-profile/security/api-tokens\n");
    process.exit(1);
  }
}

testConnection();
