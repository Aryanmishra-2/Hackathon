const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    // Check if SMTP is configured
    if (!process.env.SMTP_USER || process.env.SMTP_USER === "your-email@gmail.com") {
      console.warn("⚠️  SMTP not configured. Emails will not be sent.");
      console.warn("⚠️  Please update SMTP_USER and SMTP_PASS in .env file");
      this.isConfigured = false;
      return;
    }

    this.isConfigured = true;

    // Create reusable transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    this.fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

    console.log("✅ Email Service initialized");
    console.log(`📧 SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`📧 SMTP User: ${process.env.SMTP_USER}`);
  }

  // ==========================================
  // Send Performance Review Report Email
  // ==========================================

  async sendPerformanceReportEmail(to, subject, employeeName, reviewPeriod, pdfBuffer) {
    try {
      // Check if SMTP is configured
      if (!this.isConfigured) {
        console.warn(`⚠️  Email not sent to ${to}: SMTP not configured`);
        return {
          success: false,
          error: "SMTP not configured",
        };
      }

      console.log(`📧 Sending email to: ${to}`);
      console.log(`📧 Subject: ${subject}`);

      const mailOptions = {
        from: `"Performance Management System" <${this.fromEmail}>`,
        to: to,
        subject: subject,
        html: this.getPerformanceReportEmailTemplate(employeeName, reviewPeriod),
        attachments: [
          {
            filename: `Performance_Report_${employeeName.replace(/\s+/g, "_")}_${reviewPeriod.replace(/\s+/g, "_")}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==========================================
  // Performance Report Email Template
  // ==========================================

  getPerformanceReportEmailTemplate(employeeName, reviewPeriod) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .info-box {
            background: white;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-box p {
            margin: 8px 0;
          }
          .info-box strong {
            color: #2563eb;
          }
          .footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            font-size: 12px;
          }
          .footer a {
            color: #60a5fa;
            text-decoration: none;
          }
          .button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Performance Review Report</h1>
        </div>
        
        <div class="content">
          <div class="greeting">
            <p>Hello,</p>
          </div>
          
          <p>
            The Performance Review for <strong>${employeeName}</strong> has been completed and is now available.
          </p>
          
          <div class="info-box">
            <p><strong>📅 Review Period:</strong> ${reviewPeriod}</p>
            <p><strong>👤 Employee:</strong> ${employeeName}</p>
            <p><strong>📎 Attachment:</strong> Performance Report (PDF)</p>
          </div>
          
          <p>
            The detailed performance report is attached to this email as a PDF document. 
            Please review the document for comprehensive insights into the employee's performance during this period.
          </p>
          
          <p style="margin-top: 30px;">
            <strong>What's included in the report:</strong>
          </p>
          <ul style="line-height: 1.8;">
            <li>Employee and Manager Details</li>
            <li>Performance Rating</li>
            <li>Performance Summary</li>
            <li>Key Strengths</li>
            <li>Areas for Improvement</li>
            <li>Recommendations</li>
            <li>Goals and Progress</li>
            <li>Timeline Activities</li>
          </ul>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            <strong>Note:</strong> This is an automated email. The PDF report is attached and fully downloadable.
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Performance Management System. All rights reserved.</p>
          <p style="margin-top: 10px;">
            This email was sent automatically by the PMS. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // ==========================================
  // Test Email Configuration
  // ==========================================

  async testConnection() {
    try {
      if (!this.isConfigured) {
        console.warn("⚠️  SMTP not configured. Cannot test connection.");
        return false;
      }

      await this.transporter.verify();
      console.log("✅ SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("❌ SMTP connection failed:", error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
