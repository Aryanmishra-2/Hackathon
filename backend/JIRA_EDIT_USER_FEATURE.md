# Jira Invitation for Existing Users - Feature Documentation

## ✅ Feature Added: Send Jira Invitation When Editing Users

HR can now send Jira workspace invitations to existing users who don't have a Jira account yet!

---

## How It Works

### Scenario 1: Editing User WITHOUT Jira Account

**Steps:**
1. HR logs in → Goes to Users page
2. Clicks "Edit" button on any user
3. Modal opens with user details
4. **NEW:** Shows Jira invitation checkbox (only if user doesn't have Jira account)
5. HR updates user details + checks "Send Jira Workspace Invitation"
6. Clicks "Update User"

**Backend Process:**
```
1. Check if user already has jiraAccountId
   ↓
2. If NO jiraAccountId:
   - Call Jira API to invite user
   - Link Jira account ID to PMS user
   - Send invitation email (if user doesn't exist in Jira)
   ↓
3. If YES jiraAccountId:
   - Skip invitation (already connected)
```

**Console Logs:**
```
[HR Service] Jira invitation requested for existing user: test@example.com
[Jira] Attempting to invite user: test@example.com
[Jira] User not found in workspace. Sending organization invitation...
[Jira] Invitation sent successfully, Account ID: 712020:xxx
[HR Service] ✓ Existing user test@example.com linked to Jira account: 712020:xxx
```

---

### Scenario 2: Editing User WITH Jira Account

**UI Display:**
- Modal shows: ✅ "Jira Account Connected"
- Green box with account ID preview
- **No checkbox shown** (user already has Jira)

**Message:**
```
✓ Jira Account Connected
This user is already connected to Jira workspace.
Account ID: 712020:xxx...
```

---

## API Changes

### Backend: Update User Endpoint

**Endpoint:** `PUT /api/hr/users/:id`

**Request Body (Extended):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "EMPLOYEE",
  "department": "Engineering",
  "designation": "Developer",
  "managerId": "user-id-123",
  "inviteToJira": true  // ← NEW FIELD
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id-456",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EMPLOYEE",
    "department": "Engineering",
    "designation": "Developer",
    "managerId": "user-id-123",
    "jiraAccountId": "712020:xxx",  // ← UPDATED
    "jiraInvited": true,              // ← UPDATED
    "updatedAt": "2026-06-28T10:00:00Z"
  }
}
```

---

### Backend: Get Users Endpoint (Enhanced)

**Endpoint:** `GET /api/hr/users`

**Response (Now includes Jira fields):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-id-123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "EMPLOYEE",
      "department": "Engineering",
      "designation": "Developer",
      "managerId": null,
      "jiraAccountId": "712020:xxx",  // ← NEW
      "jiraInvited": true,              // ← NEW
      "createdAt": "2026-06-28T10:00:00Z",
      "updatedAt": "2026-06-28T10:00:00Z"
    }
  ]
}
```

---

## Frontend Changes

### CreateUserModal.jsx

**New State:**
```javascript
const [showJiraOption, setShowJiraOption] = useState(false);
```

**Logic:**
```javascript
// Show Jira checkbox only if user doesn't have Jira account
if (editUser) {
  setShowJiraOption(!editUser.jiraAccountId);
}
```

**UI Conditions:**

1. **Create Mode:** Always show Jira checkbox
2. **Edit Mode - No Jira Account:** Show Jira checkbox
3. **Edit Mode - Has Jira Account:** Show green "Connected" message

---

## Testing Guide

### Test 1: Edit User Without Jira Account

1. **Create test user WITHOUT Jira invitation:**
   ```
   Name: Test User 1
   Email: test1@example.com
   ✗ Don't check Jira invitation
   ```

2. **Edit the user:**
   - Click "Edit" button
   - Should see Jira invitation checkbox
   - Check "Send Jira Workspace Invitation"
   - Click "Update User"

3. **Verify:**
   - Check backend console for logs
   - Check database: User should have `jiraAccountId`
   - User receives Jira invitation email

### Test 2: Edit User With Jira Account

1. **Create test user WITH Jira invitation:**
   ```
   Name: Test User 2
   Email: test2@example.com
   ✓ Check Jira invitation
   ```

2. **Edit the user:**
   - Click "Edit" button
   - Should see: ✅ "Jira Account Connected"
   - Should NOT see checkbox

3. **Verify:**
   - Update other fields (name, department, etc.)
   - Click "Update User"
   - Jira account remains unchanged

### Test 3: Batch Update Multiple Users

1. Create 3 users without Jira
2. Edit each one and send Jira invitation
3. Verify all 3 users get Jira accounts

---

## Files Modified

### Backend (2 files)
1. `backend/src/services/hr.service.js`
   - Updated `updateUser()` to handle Jira invitation
   - Updated `getUsers()` to include `jiraAccountId` and `jiraInvited`

2. `backend/src/services/jira.service.js`
   - Already supports invitation (no changes needed)

### Frontend (1 file)
1. `frontend/src/pages/hr/CreateUserModal.jsx`
   - Added `showJiraOption` state
   - Logic to show/hide Jira checkbox based on user's Jira status
   - Green "Connected" message for users with Jira account
   - Updated form submission to include `inviteToJira` in edit mode

---

## Error Handling

### User Already Has Jira Account
```
[HR Service] User test@example.com already has Jira account ID: 712020:xxx
```
**Action:** Skip invitation, no error thrown

### Jira API Error
```
[HR Service] ✗ Jira invitation failed for test@example.com: Permission denied
```
**Action:** User update succeeds, Jira invitation fails gracefully

### User Doesn't Exist in PMS
```
Error: User not found.
```
**Action:** Return 404 error

---

## Benefits

✅ **Flexible:** HR can invite users to Jira anytime, not just during creation  
✅ **Safe:** Prevents duplicate invitations (checks existing Jira account)  
✅ **User-Friendly:** Clear UI showing Jira connection status  
✅ **Non-Breaking:** Jira invitation failure doesn't block user updates  
✅ **Efficient:** Automatic account linking if user already exists in Jira  

---

## Use Cases

### Use Case 1: Forgot to Invite During Creation
**Problem:** HR created 10 users but forgot to check Jira invitation  
**Solution:** Edit each user and send invitation individually

### Use Case 2: Onboarding New Department
**Problem:** 20 employees joined, need Jira access after probation  
**Solution:** Edit users after probation period and invite to Jira

### Use Case 3: Jira Integration Added Later
**Problem:** Company started using Jira after PMS was already in use  
**Solution:** Edit all existing users and invite to Jira workspace

---

## Future Enhancements

- [ ] Bulk Jira invitation (select multiple users, send all at once)
- [ ] Jira status indicator in Users list (show 🔗 icon for connected users)
- [ ] Resend Jira invitation option
- [ ] Revoke Jira access from PMS

---

## Status

**Feature Status:** ✅ Complete and Ready  
**Backend:** ✅ Implemented  
**Frontend:** ✅ Implemented  
**Testing:** ✅ Ready to test  
**Documentation:** ✅ Complete  

---

**Next Steps:**
1. Test the feature with real users
2. Monitor backend logs for any issues
3. Gather HR feedback on UX

**Questions?** Check `JIRA_INVITATION_GUIDE.md` for troubleshooting!
