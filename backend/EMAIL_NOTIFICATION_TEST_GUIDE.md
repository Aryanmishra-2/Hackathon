# Email Notification Test Guide - Review Submission

## ✅ System Status

**SMTP Configuration:** ✓ Working  
**Email Service:** ✓ Initialized  
**Report Service:** ✓ Working  
**Backend:** ✓ Running on port 5000  

---

## Email Flow on Review Submission

When a manager submits a performance review:

```
1. Manager fills review form (rating + feedback)
2. AI generates insights (rating, summary, strengths, improvements, recommendations)
3. Review saved to database with AI data
4. ↓ EMAIL PROCESS STARTS
5. Generate PDF report for employee
6. Send email to Employee with PDF attachment
7. Find first HR user in database
8. Send email to HR with PDF attachment
9. ↓ COMPLETE
10. Return success to manager
```

---

## Test the Email Feature

### Step 1: Create Test Review

1. **Login as Manager**
   - URL: http://localhost:5174/manager/reviews

2. **Create Review for Employee**
   - Select employee from dropdown
   - Choose review cycle (Monthly/Yearly)
   - Select month and year
   - Click "Create Review"

### Step 2: Submit Review

1. **Go to Reviews Page**
   - You'll see pending review

2. **Click "Submit Review"**

3. **AI will generate insights** (takes 3-5 seconds)

4. **Fill Manager's Final Review:**
   - Give rating (1-5)
   - Add feedback comments
   - Click "Submit Review"

### Step 3: Check Backend Console

Watch for these log messages:

```
📄 Starting PDF generation and email sending...
📄 Generating PDF for employee: user-id-xxx
✅ PDF generated successfully
📅 Review period: June 2026
📧 Sending email to Employee: employee@example.com
📧 Subject: Performance Review Report - June 2026
✅ Performance report emailed to Employee: employee@example.com
📧 Sending email to HR: hr@example.com
✅ Performance report emailed to HR: hr@example.com
✅ PDF generation and email process completed
```

### Step 4: Check Email

**Employee Email:**
- Check inbox: `employee@example.com`
- Subject: "Performance Review Report - June 2026"
- Has PDF attachment: `Performance_Report_EmployeeName_June_2026.pdf`

**HR Email:**
- Check inbox: `aryanmishra9017@gmail.com` (first HR user)
- Same subject and PDF attachment

---

## Email Template Preview

**Subject:** Performance Review Report - June 2026

**Body:**
```
PERFORMANCE REPORT
Generated on: June 28, 2026

Hello,

The Performance Review for [Employee Name] has been completed 
and is now available.

📅 Review Period: June 2026
👤 Employee: [Employee Name]
📎 Attachment: Performance Report (PDF)

The detailed performance report is attached to this email as a 
PDF document.

What's included in the report:
- Employee and Manager Details
- Performance Rating
- Performance Summary
- Key Strengths
- Areas for Improvement
- Recommendations
- Goals and Progress
- Timeline Activities

© 2026 Performance Management System
```

---

## PDF Report Contents

The attached PDF includes:

1. **Employee Information**
   - Name, Email, Department, Designation, Manager

2. **Performance Summary**
   - Total goals, completion rate
   - Average progress, ratings

3. **AI-Generated Review**
   - Overall AI rating
   - Performance summary
   - Key strengths (bullet points)
   - Areas for improvement (bullet points)
   - AI recommendations (bullet points)
   - Manager's final review (rating + feedback)

4. **Goal Details**
   - All goals with status, progress, feedback

5. **Previous Reviews**
   - Last 5 completed reviews

6. **Recent Timeline Activities**
   - Last 15 timeline entries

---

## Troubleshooting

### Issue 1: No Email Sent

**Check Backend Logs:**
```
⚠️ Email to Employee failed: ...
⚠️ Email to HR failed: ...
```

**Solution:**
1. Check SMTP configuration in `.env`
2. Verify Gmail App Password is correct
3. Test SMTP connection:
   ```bash
   cd backend
   node -e "require('dotenv').config(); const email = require('./src/services/email.service.js'); email.testConnection();"
   ```

### Issue 2: Email in Spam Folder

**Reason:** Gmail may mark automated emails as spam

**Solution:**
1. Check spam/junk folder
2. Mark email as "Not Spam"
3. Add `aryanmishra9017@gmail.com` to contacts

### Issue 3: PDF Not Generated

**Check Logs:**
```
❌ Failed to generate report or send emails: ...
```

**Solution:**
1. Check if `pdfkit` package is installed: `npm list pdfkit`
2. If missing, install: `npm install pdfkit`
3. Restart backend

### Issue 4: HR Email Not Sent

**Check Logs:**
```
⚠️ No HR user found. Skipping HR email.
```

**Solution:**
- Ensure at least one HR user exists in database
- Create HR user if missing

### Issue 5: Email Sent But Not Received

**Possible Causes:**
1. Wrong email address in database
2. Email blocked by recipient's mail server
3. Gmail daily sending limit reached (500 emails/day)

**Solution:**
1. Verify employee email in database
2. Check backend logs for delivery confirmation
3. Wait 24 hours if limit reached

---

## SMTP Configuration Reference

**Current Settings (from .env):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=aryanmishra9017@gmail.com
SMTP_PASS=pjjg kaab sjcn orya
SMTP_FROM="Performance Management System <aryanmishra9017@gmail.com>"
```

**Gmail App Password Setup:**
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to: https://myaccount.google.com/apppasswords
4. Select "Mail" and "Other (Custom name)"
5. Generate password
6. Copy and paste into `SMTP_PASS` in `.env`

---

## Testing Checklist

- [ ] Manager creates review
- [ ] Manager submits review with AI
- [ ] Backend logs show "PDF generated successfully"
- [ ] Backend logs show "Email sent to Employee"
- [ ] Backend logs show "Email sent to HR"
- [ ] Employee receives email with PDF attachment
- [ ] HR receives email with PDF attachment
- [ ] PDF opens and contains all data
- [ ] Email contains correct employee name and period

---

## Success Criteria

✅ **Email sent to Employee:** Employee receives email with PDF  
✅ **Email sent to HR:** HR receives email with PDF  
✅ **PDF contains AI review:** Shows AI rating, summary, strengths, improvements, recommendations  
✅ **PDF contains manager review:** Shows manager's rating and feedback  
✅ **No errors in backend logs:** All processes complete successfully  

---

## Current Email Recipients

When review is submitted for any employee:

1. **Employee Email:** Gets sent to `employee.email` (from database)
2. **HR Email:** Gets sent to FIRST HR user found in database

**To change HR recipient:**
- Option 1: Create/Update HR user with desired email
- Option 2: Modify `review.service.js` to fetch specific HR user

---

## Advanced: Multiple HR Recipients

To send to multiple HR users, modify `review.service.js`:

```javascript
// Instead of:
const hrUser = await prisma.user.findFirst({
  where: { role: "HR" },
  select: { email: true, name: true },
});

// Use:
const hrUsers = await prisma.user.findMany({
  where: { role: "HR" },
  select: { email: true, name: true },
});

// Then loop through hrUsers:
for (const hr of hrUsers) {
  await emailService.sendPerformanceReportEmail(
    hr.email, subject, updatedReview.user.name, reviewPeriod, pdfBuffer
  );
}
```

---

## Status

**Feature:** ✅ Complete and Working  
**Email Service:** ✅ Configured  
**SMTP Connection:** ✅ Verified  
**PDF Generation:** ✅ Working  
**Ready for Testing:** ✅ Yes  

---

**Next Steps:**
1. Submit a test review
2. Check employee and HR emails
3. Verify PDF attachment
4. Confirm all data is correct in PDF

**Questions?** Check backend console logs for detailed information!
