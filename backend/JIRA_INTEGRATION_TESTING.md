# Jira Integration Testing Guide

## Overview
Enterprise-level Jira integration with two-way synchronization for Performance Management System.

## Configuration Required

### 1. Jira Setup
Before testing, configure your Jira workspace credentials in `backend/.env`:

```env
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_ADMIN_EMAIL=jira-admin@your-company.com
JIRA_API_TOKEN=your_jira_api_token_here
JIRA_PROJECT_KEY=PMS
```

**How to get Jira API Token:**
1. Log in to Atlassian: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a label (e.g., "PMS Integration")
4. Copy the token and add to `.env`

### 2. Jira Project Setup
1. Create a project in Jira with key `PMS` (or update `JIRA_PROJECT_KEY` in `.env`)
2. Ensure the project has these issue types: `Task`
3. Ensure workflow has these statuses: `To Do`, `In Progress`, `Done`

### 3. Configure Jira Webhook (Two-Way Sync)
To enable automatic sync from Jira to PMS:

1. Go to Jira Settings → System → WebHooks
2. Click "Create a WebHook"
3. Configure:
   - Name: `PMS Integration`
   - Status: `Enabled`
   - URL: `http://your-backend-url:5000/api/jira/webhook`
   - Events: Select `issue updated`
4. Save webhook

**For local testing (ngrok):**
```bash
ngrok http 5000
# Use the ngrok URL: https://xyz.ngrok.io/api/jira/webhook
```

---

## Complete Workflow Testing

### Step 1: HR Creates User with Jira Invitation

**Frontend (HR Dashboard):**
1. Login as HR user
2. Navigate to "Users" page
3. Click "Create User" button
4. Fill in user details:
   - Name: `Test Employee`
   - Email: `test.employee@company.com`
   - Password: `password123`
   - Role: `EMPLOYEE`
   - Department: `Engineering`
   - Designation: `Software Developer`
   - Manager: Select a manager
5. **Check the "Invite to Jira Workspace" checkbox** ✅
6. Click "Create User"

**Expected Results:**
- ✅ User created in PMS database
- ✅ Jira invitation email sent to `test.employee@company.com`
- ✅ User's `jiraAccountId` stored in database
- ✅ User's `jiraInvited` set to `true`
- ✅ If user already exists in Jira, account is linked automatically

**Verify:**
```bash
# Check database
cd backend
npx prisma studio
# Open User table and check jiraAccountId and jiraInvited fields
```

---

### Step 2: Employee Accepts Jira Invitation

**Jira (Employee's Email):**
1. Employee receives email: "You've been invited to join [Company] on Jira"
2. Click invitation link
3. Complete Jira account setup
4. Accept invitation

**Expected Results:**
- ✅ Employee can now access company Jira workspace
- ✅ Employee is assigned to PMS project

---

### Step 3: Employee Creates Goal

**Frontend (Employee Dashboard):**
1. Login as the test employee
2. Navigate to "Goals" page
3. Click "Create Goal" button
4. Fill in goal details:
   - Title: `Complete API Integration Feature`
   - Description: `Implement REST API for user management`
   - Start Date: Today
   - End Date: 30 days from now
5. Click "Create Goal"

**Expected Results:**
- ✅ Goal created with status `PENDING`
- ✅ No Jira task created yet (waiting for manager approval)
- ✅ Goal visible in Employee's Goals page
- ✅ Manager receives notification about new goal

**Verify:**
```sql
SELECT id, title, status, jiraIssueKey FROM Goal WHERE title = 'Complete API Integration Feature';
-- Expected: status=PENDING, jiraIssueKey=null
```

---

### Step 4: Manager Approves Goal

**Frontend (Manager Dashboard):**
1. Login as the manager
2. Navigate to "Team Goals" page
3. Find the pending goal: `Complete API Integration Feature`
4. Click "Approve" button
5. Add optional feedback comment
6. Confirm approval

**Expected Results:**
- ✅ Goal status changed to `APPROVED`
- ✅ **Jira task automatically created** (async operation)
- ✅ Task assigned to employee in Jira
- ✅ Goal updated with `jiraIssueKey`, `jiraIssueUrl`, `jiraStatus`
- ✅ Timeline entry created: "Jira Task Created"
- ✅ Notification sent to employee
- ✅ "Open in Jira" button visible on goal card

**Verify:**
```sql
SELECT id, status, jiraIssueKey, jiraIssueUrl, jiraStatus FROM Goal 
WHERE title = 'Complete API Integration Feature';
-- Expected: status=APPROVED, jiraIssueKey=PMS-123, jiraStatus='To Do'
```

**Verify in Jira:**
1. Login to Jira workspace
2. Navigate to PMS project
3. Check for new task with title: `Complete API Integration Feature`
4. Verify assignee is the employee
5. Verify status is `To Do`

---

### Step 5: Employee Updates Progress in PMS

**Frontend (Employee Dashboard):**
1. Navigate to "Goals" page
2. Open the approved goal
3. Update progress to `50%`
4. Save changes

**Expected Results:**
- ✅ Goal progress updated in PMS
- ✅ **Jira task status automatically synced** (async operation)
- ✅ Jira status changes from `To Do` → `In Progress`
- ✅ Timeline entry created

**Verify in Jira:**
1. Refresh Jira issue page
2. Status should be `In Progress`

**Test Progress Mapping:**
- `0%` → Jira status: `To Do`
- `1-49%` → Jira status: `In Progress`
- `50-99%` → Jira status: `In Progress`
- `100%` → Jira status: `Done`

---

### Step 6: Two-Way Sync (Jira → PMS)

**Jira Workspace:**
1. Login to Jira
2. Open the PMS project
3. Find the task: `Complete API Integration Feature`
4. Change status from `In Progress` → `Done`
5. Save changes

**Expected Results (Webhook Trigger):**
- ✅ Jira webhook fires `jira:issue_updated` event
- ✅ PMS receives webhook at `/api/jira/webhook`
- ✅ Goal progress updated to `100%`
- ✅ Goal status changed to `COMPLETED`
- ✅ Timeline entry created: "Jira Status Synced"
- ✅ Notification sent to employee: "Goal Synced from Jira"

**Verify:**
```sql
SELECT id, progress, status, jiraStatus FROM Goal 
WHERE jiraIssueKey = 'PMS-123';
-- Expected: progress=100, status=COMPLETED, jiraStatus='Done'
```

**Frontend (Employee Dashboard):**
1. Refresh dashboard
2. Goal should show 100% progress
3. Status should be `COMPLETED`
4. Check notifications for sync message

---

## API Endpoints Testing

### 1. Manual Batch Sync
```bash
curl -X POST http://localhost:5000/api/jira/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "synced": 5,
  "failed": 0,
  "message": "Synced 5 goals, 0 failed"
}
```

### 2. Get Task Details
```bash
curl http://localhost:5000/api/jira/task/PMS-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "key": "PMS-123",
    "summary": "Complete API Integration Feature",
    "status": "In Progress",
    "assignee": "Test Employee",
    "created": "2026-06-28T10:00:00Z",
    "updated": "2026-06-28T12:00:00Z"
  }
}
```

### 3. Webhook Endpoint (Public)
```bash
# This endpoint receives webhooks from Jira
# Test webhook payload:
curl -X POST http://localhost:5000/api/jira/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "webhookEvent": "jira:issue_updated",
    "issue": {
      "key": "PMS-123",
      "fields": {
        "status": {
          "name": "Done"
        }
      }
    }
  }'
```

---

## Dashboard Indicators Testing

### Employee Dashboard
**Expected UI:**
- Blue info box showing: "🔗 Jira Account Connected"
- Message: "Your approved goals will automatically sync with Jira as assigned tasks."
- Only visible if employee has `jiraAccountId`

### Manager Dashboard
**Expected UI:**
- Blue info box showing: "🔗 Jira Integration Active"
- Message: "Team goals are automatically synced with Jira. Approved goals create Jira tasks."
- Visible when Jira is configured

### HR Dashboard
**Expected UI:**
- Blue info box showing: "🔗 Jira Integration Active"
- Message: "Organization-wide Jira integration is enabled. Invite users to Jira when creating new employees."
- Visible when Jira is configured

---

## Goal Cards Testing

### Employee Goal Card
**Expected UI:**
- When goal has `jiraIssueKey`:
  - Blue section below progress bar
  - Shows: "🔗 Jira Task: PMS-123"
  - Shows: "Status: In Progress"
  - "Open in Jira →" button (blue, opens in new tab)

### Manager Goal Card
**Expected UI:**
- When goal has `jiraIssueKey`:
  - Blue section in sidebar column (above action buttons)
  - Shows: "🔗 PMS-123"
  - Shows Jira status
  - "Open in Jira →" button

---

## Error Handling Testing

### 1. Jira Not Configured
- Leave `.env` variables empty
- Create user with "Invite to Jira" checked
- **Expected:** User created successfully, Jira invitation skipped (logged as warning)

### 2. Invalid Jira Credentials
- Set wrong API token in `.env`
- Approve a goal
- **Expected:** Goal approved, Jira task creation fails gracefully, `jiraSyncStatus=FAILED`

### 3. Employee Not Invited to Jira
- Create employee without checking "Invite to Jira"
- Manager approves goal
- **Expected:** Goal approved, no Jira task created (employee has no `jiraAccountId`)

### 4. Network Error
- Disconnect from internet
- Update goal progress
- **Expected:** Progress saved in PMS, Jira sync fails gracefully (logged)

---

## Checklist Summary

### HR Flow
- [ ] Create user with Jira invitation checkbox
- [ ] Verify invitation email sent
- [ ] Verify `jiraAccountId` stored
- [ ] Test with existing Jira user (should link, not invite)

### Employee Flow
- [ ] Create goal
- [ ] View goal without Jira info (pending)
- [ ] After approval, see Jira issue key and button
- [ ] Update progress, verify Jira syncs
- [ ] Receive notification when Jira updates

### Manager Flow
- [ ] See pending goals
- [ ] Approve goal
- [ ] Verify Jira task auto-created
- [ ] View Jira info on goal card
- [ ] Click "Open in Jira" button

### Two-Way Sync
- [ ] PMS → Jira: Update progress syncs status
- [ ] Jira → PMS: Update status syncs progress
- [ ] Webhook endpoint receives events
- [ ] Timeline entries created
- [ ] Notifications sent

### Dashboard Indicators
- [ ] Employee dashboard shows Jira connection status
- [ ] Manager dashboard shows integration active
- [ ] HR dashboard shows integration active

### Error Cases
- [ ] Jira not configured (graceful degradation)
- [ ] Invalid credentials (error logged, app continues)
- [ ] Employee not invited (no task created)
- [ ] Network errors (graceful failure)

---

## Troubleshooting

### Issue: Jira task not created after approval
**Solution:**
1. Check backend logs for errors
2. Verify `.env` configuration
3. Verify employee has `jiraAccountId` in database
4. Check Jira project permissions

### Issue: Webhook not firing
**Solution:**
1. Verify webhook URL is correct
2. For local testing, use ngrok
3. Check Jira webhook logs (Settings → System → WebHooks)
4. Verify backend `/api/jira/webhook` endpoint is accessible

### Issue: Progress not syncing to Jira
**Solution:**
1. Check if goal has `jiraIssueKey`
2. Verify Jira credentials in `.env`
3. Check backend logs for transition errors
4. Verify Jira workflow has required statuses

### Issue: Status not syncing from Jira to PMS
**Solution:**
1. Verify webhook is configured in Jira
2. Check webhook URL is correct
3. Test webhook with curl command
4. Check backend logs for webhook events

---

## Database Schema Reference

### User Table
```prisma
model User {
  jiraAccountId  String?   // Jira account ID
  jiraInvited    Boolean   @default(false)
}
```

### Goal Table
```prisma
model Goal {
  jiraIssueKey   String?   // PMS-123
  jiraIssueUrl   String?   // https://company.atlassian.net/browse/PMS-123
  jiraStatus     String?   // To Do, In Progress, Done
  jiraSyncStatus String    @default("NOT_SYNCED") // NOT_SYNCED, SYNCED, FAILED
}
```

---

## Integration Complete ✅

All Jira integration features are implemented and ready for testing:
- ✅ Database schema with Jira fields
- ✅ Jira service module with all APIs
- ✅ HR user creation with optional invitation
- ✅ Auto-create Jira tasks on goal approval
- ✅ Two-way synchronization (PMS ↔ Jira)
- ✅ Webhook endpoint for Jira events
- ✅ Frontend UI with Jira indicators
- ✅ Timeline and notification integration
- ✅ Graceful error handling
