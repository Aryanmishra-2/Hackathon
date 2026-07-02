# Jira User Invitation Guide

## ✅ Jira Integration Status

**Configuration:** ✓ Complete  
**Backend:** ✓ Running with SSL fix  
**Logging:** ✓ Enhanced with detailed messages  

---

## How Jira Invitation Works

### 1. Create User with Jira Invitation

When HR creates a user and checks "Invite to Jira Workspace":

```
HR Dashboard → Users → Create User
↓
Fill user details + Check "Invite to Jira Workspace"
↓
Backend receives: { ...userData, inviteToJira: true }
↓
User created in PMS database
↓
Jira API called to invite user
↓
Two scenarios:
  A) User doesn't exist → Send invitation email
  B) User already exists → Link existing account
```

### 2. What Happens in Backend

**Console Logs to Watch:**
```
[HR Service] Jira invitation requested for user: test@example.com
[Jira] Attempting to invite user: test@example.com
[Jira] User not found in workspace. Sending organization invitation...
[Jira] Invitation sent successfully to test@example.com, Account ID: xxx
[HR Service] ✓ User test@example.com linked to Jira account: xxx
```

---

## Testing the Invitation Flow

### Step 1: Create Test User with Jira Invitation

1. **Login as HR**
   - Go to: `http://localhost:5174/hr/users`

2. **Click "Create User"**

3. **Fill Details:**
   - Name: `Test Employee`
   - Email: `test.employee@gmail.com` (use real email you can access)
   - Password: `password123`
   - Role: `EMPLOYEE`
   - Department: `Engineering`
   - Designation: `Developer`
   - **✓ Check "Invite to Jira Workspace"** ← Important!

4. **Click "Create User"**

5. **Check Backend Console Logs:**
   - Open PowerShell where backend is running
   - Look for `[Jira]` prefixed messages
   - Should see invitation logs

### Step 2: Verify in Database

```bash
cd backend
npx prisma studio
```

- Open `User` table
- Find the created user
- Check fields:
  - `jiraAccountId`: Should have value (e.g., `712020:xxx`)
  - `jiraInvited`: Should be `true`

### Step 3: Check Email

**If User Doesn't Exist in Jira:**
- User receives email: "You've been invited to join [Company] on Jira"
- Email contains invitation link
- Click link to accept and create Jira account

**If User Already Exists in Jira:**
- No email sent
- Account automatically linked
- User can immediately access Jira

---

## Troubleshooting

### Issue 1: No Email Received

**Possible Causes:**
1. User already exists in Jira workspace
2. Email went to spam folder
3. Jira API permissions issue

**Solution:**
```bash
# Check backend logs for:
[Jira] User already exists in Jira workspace with accountId: xxx
```

If user exists, account is automatically linked - no email needed!

### Issue 2: Permission Denied Error

**Error in Logs:**
```
[Jira] Permission denied. Please check:
  1. API token is valid and not expired
  2. Admin account has 'Administer Jira' permission
  3. Organization allows user creation via API
```

**Solution:**
1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Create new API token
3. Update `JIRA_API_TOKEN` in `.env`
4. Restart backend

### Issue 3: SSL Certificate Error

**Already Fixed!** Added in `jira.service.js`:
```javascript
httpsAgent: process.env.NODE_ENV === 'development' ? 
  new (require('https').Agent)({ rejectUnauthorized: false }) : undefined
```

This bypasses SSL verification in development mode.

### Issue 4: Jira API Rate Limiting

**Error:** `429 Too Many Requests`

**Solution:** Jira Cloud has rate limits. Wait 60 seconds and try again.

---

## Alternative: Manual Jira Invitation

If API invitation doesn't work, manually invite users:

### Method 1: Via Jira Admin Panel

1. Go to: `https://aryanmishra9017-1782760382220.atlassian.net`
2. Click Settings (⚙️) → User management
3. Click "Invite users"
4. Enter email address
5. Select "Jira Software" access
6. Send invitation

### Method 2: Via Atlassian Admin

1. Go to: https://admin.atlassian.com
2. Select your organization
3. Go to "Users" tab
4. Click "Invite users"
5. Enter email and send

### After Manual Invitation

The PMS system will automatically detect the user when they:
1. Accept Jira invitation
2. Create goal that gets approved
3. System searches for user in Jira by email
4. Automatically links `jiraAccountId`

---

## Verify Jira Connection

Run this test script:

```bash
cd backend
node test-jira-connection.js
```

**Expected Output:**
```
✓ SUCCESS - Connected as: aryanmishra
✓ SUCCESS - Project found: Performance Management System
✓ SUCCESS - Permissions: ...
```

---

## How Goal → Jira Task Works

After user is invited to Jira:

```
1. Employee creates goal
2. Manager approves goal
3. Backend auto-creates Jira task
4. Task assigned to employee (uses jiraAccountId)
5. Employee sees task in Jira workspace
6. Progress syncs both ways
```

**Important:** Goal must be APPROVED by manager for Jira task to be created!

---

## Current Configuration

```env
JIRA_BASE_URL=https://aryanmishra9017-1782760382220.atlassian.net
JIRA_ADMIN_EMAIL=aryanmishra9017@gmail.com
JIRA_API_TOKEN=ATATT3xFf... (hidden for security)
JIRA_PROJECT_KEY=PMS
NODE_ENV=development (enables SSL bypass)
```

---

## Console Log Reference

**Successful Invitation:**
```
[HR Service] Jira invitation requested for user: test@example.com
[Jira] Attempting to invite user: test@example.com
[Jira] User not found in workspace. Sending organization invitation...
[Jira] Invitation sent successfully, Account ID: 712020:xxx
[HR Service] ✓ User test@example.com linked to Jira account: 712020:xxx
```

**User Already Exists:**
```
[HR Service] Jira invitation requested for user: test@example.com
[Jira] Attempting to invite user: test@example.com
[Jira] User already exists with accountId: 712020:xxx
[HR Service] ✓ User test@example.com linked to Jira account: 712020:xxx
```

**Invitation Failed:**
```
[HR Service] Jira invitation requested for user: test@example.com
[Jira] Attempting to invite user: test@example.com
[Jira] Invitation error: { status: 403, ... }
[HR Service] ✗ Jira invitation failed for test@example.com: Permission denied
```

User is still created in PMS - Jira invitation failure doesn't block user creation!

---

## Next Steps

1. **Test with Real Email:** Create user with your own email to see invitation
2. **Check Jira Dashboard:** Visit Jira to see invited users
3. **Test Full Flow:** Create user → Create goal → Approve → Check Jira task

---

**Status:** ✅ Ready to test!  
**Backend Logs:** Watch console for `[Jira]` messages  
**Issues?** Check backend console logs for detailed error messages
