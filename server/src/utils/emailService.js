import nodemailer from "nodemailer";
import { EMAIL_FROM, EMAIL_USER, EMAIL_PASS } from "../config/env.js";

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Generic function to send email

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    // Non-blocking: we don't throw error to avoid breaking the caller
  }
};

// Send email when admin approves or rejects an education record submission
export const sendEducationStatusEmail = async (
  citizenEmail,
  citizenName,
  recordDetails,
  status,
) => {
  const subject = `Education Record ${status} - eBangla Identity`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: ${status === "Verified" ? "#2e7d32" : "#d32f2f"};">${status === "Verified" ? "Qualification Approved" : "Qualification Rejected"}</h2>
      <p>Hello <strong>${citizenName}</strong>,</p>
      <p>Your educational qualification for <strong>${recordDetails.qualification}</strong> at <strong>${recordDetails.institution}</strong> has been <strong>${status.toLowerCase()}</strong> by the administrator.</p>
      ${status === "Verified" ? "<p>This qualification is now part of your verified digital identity.</p>" : "<p>Please review your submission and ensure all details and documents are correct before re-submitting.</p>"}
      <br />
      <p>Best regards,<br />eBangla Identity Team</p>
    </div>
  `;

  return sendEmail({ to: citizenEmail, subject, html });
};

// Send email when admin adds an education record directly
export const sendAdminAddedEducationEmail = async (
  citizenEmail,
  citizenName,
  recordDetails,
) => {
  const subject = "New Qualification Added - eBangla Identity";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #1976d2;">New Verified Qualification</h2>
      <p>Hello <strong>${citizenName}</strong>,</p>
      <p>An administrator has directly added a new verified qualification to your profile:</p>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Qualification:</strong> ${recordDetails.qualification}</li>
        <li><strong>Institution:</strong> ${recordDetails.institution}</li>
        <li><strong>Passing Year:</strong> ${recordDetails.passingYear}</li>
      </ul>
      <p>This qualification is now visible in your records.</p>
      <br />
      <p>Best regards,<br />eBangla Identity Team</p>
    </div>
  `;

  return sendEmail({ to: citizenEmail, subject, html });
};

// Send email for tax status changes
export const sendTaxStatusEmail = async (
  citizenEmail,
  citizenName,
  recordDetails,
  status,
) => {
  const subject = `Tax Record ${status} - eBangla Identity`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: ${status === "Paid" ? "#2e7d32" : "#d32f2f"};">${status === "Paid" ? "Tax Payment Confirmed" : "Tax Record Rejected"}</h2>
      <p>Hello <strong>${citizenName}</strong>,</p>
      <p>Your tax record for the fiscal year <strong>${recordDetails.fiscalYear}</strong> has been marked as <strong>${status.toLowerCase()}</strong>.</p>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Fiscal Year:</strong> ${recordDetails.fiscalYear}</li>
        <li><strong>Total Income:</strong> ৳${recordDetails.totalIncome.toLocaleString()}</li>
        <li><strong>Tax Amount:</strong> ৳${recordDetails.taxAmount.toLocaleString()}</li>
      </ul>
      <br />
      <p>Best regards,<br />eBangla Identity Team</p>
    </div>
  `;

  return sendEmail({ to: citizenEmail, subject, html });
};
