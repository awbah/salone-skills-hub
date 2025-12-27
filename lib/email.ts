// Email service - using a simple approach that can be extended
// For production, configure SMTP settings in .env

let nodemailer: any = null;
let transporter: any = null;

// Try to import nodemailer (may not be installed yet)
try {
  nodemailer = require("nodemailer");
} catch (error) {
  console.warn("nodemailer is not installed. Run 'npm install' to enable email sending.");
}

// Initialize transporter if SMTP is configured
function initializeTransporter() {
  if (!nodemailer) {
    return null;
  }

  if (transporter) {
    return transporter;
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpUser || !smtpPassword) {
    console.warn("SMTP credentials not configured. Email sending will be logged to console.");
    return null;
  }

  try {
    const isSecure = process.env.SMTP_SECURE === "true";
    const port = parseInt(process.env.SMTP_PORT || (isSecure ? "465" : "587"));
    const rejectUnauthorized = process.env.SMTP_REJECT_UNAUTHORIZED === "true";
    
    // Create transport configuration
    const transportConfig: any = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: port,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      // TLS configuration to handle certificate issues
      tls: {
        // Don't reject unauthorized certificates (for development/testing)
        rejectUnauthorized: rejectUnauthorized,
      },
      // Ignore TLS errors if rejectUnauthorized is false
      ignoreTLS: !rejectUnauthorized && process.env.SMTP_IGNORE_TLS === "true",
    };

    // For non-secure connections (port 587), require TLS
    if (!isSecure) {
      transportConfig.requireTLS = true;
    }
    
    transporter = nodemailer.createTransport(transportConfig);

    // Don't verify connection immediately - it can cause issues with self-signed certs
    // We'll let the actual send attempt handle errors
    
    return transporter;
  } catch (error) {
    console.error("Failed to initialize email transporter:", error);
    return null;
  }
}

export async function sendOTPEmail(email: string, otp: string, name: string) {
  // Initialize transporter if not already initialized
  const emailTransporter = initializeTransporter();

  // If SMTP is not configured, log the OTP (for development)
  if (!emailTransporter) {
    console.log("=".repeat(50));
    console.log("OTP EMAIL (SMTP not configured):");
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log("=".repeat(50));
    // Still return success so the flow continues in development
    return { success: true, messageId: "dev-mode" };
  }

  try {
    const smtpUser = process.env.SMTP_USER || "noreply@skillshub.sl";
    
    const mailOptions = {
      from: `"Salone SkillsHub" <${smtpUser}>`,
      to: email,
      subject: "Verify Your Email - Salone SkillsHub",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Salone SkillsHub</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Hello ${name}!</h2>
              <p>Thank you for registering with Salone SkillsHub. To complete your registration, please verify your email address using the OTP code below:</p>
              <div style="background: #f3f4f6; border: 2px dashed #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <p style="font-size: 14px; color: #6b7280; margin: 0 0 10px 0;">Your verification code is:</p>
                <h1 style="font-size: 36px; color: #10b981; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you didn't create an account, please ignore this email.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">Best regards,<br>The Salone SkillsHub Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Hello ${name}!
        
        Thank you for registering with Salone SkillsHub. To complete your registration, please verify your email address using the OTP code below:
        
        Your verification code is: ${otp}
        
        This code will expire in 10 minutes. If you didn't create an account, please ignore this email.
        
        Best regards,
        The Salone SkillsHub Team
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✓ OTP email sent successfully to ${email}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    // Check if it's a certificate error
    const isCertError = error.code === "ESOCKET" || 
                       error.message?.includes("certificate") || 
                       error.message?.includes("self-signed");
    
    if (isCertError) {
      console.warn("⚠ SMTP certificate error. To fix this:");
      console.warn("   1. Set SMTP_REJECT_UNAUTHORIZED=false in your .env file");
      console.warn("   2. Or use a proper SMTP service with valid certificates");
      console.warn("   3. For Gmail, ensure you're using an App Password, not your regular password");
    }
    
    console.error("Error sending email:", error.message || error);
    // Log the OTP to console as fallback
    console.log("=".repeat(50));
    console.log("FALLBACK - OTP EMAIL (Email sending failed):");
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log("=".repeat(50));
    // Don't throw error - allow registration to continue even if email fails
    // User can use resend OTP feature
    return { success: false, messageId: "failed", error: error.message };
  }
}

