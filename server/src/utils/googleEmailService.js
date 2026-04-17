import { google } from "googleapis";
import {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI,
  GMAIL_REFRESH_TOKEN,
  EMAIL_FROM,
} from "../config/env.js";

// Initialize the Google OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

// Helper to encode the email message into Base64url format required by Gmail API

const createMimeMessage = (to, subject, htmlContent) => {
  const messageParts = [
    `From: ${EMAIL_FROM}`,
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    htmlContent,
  ];
  const message = messageParts.join("\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

// Generic function to send email via Gmail API
const sendEmail = async (options) => {
  try {
    const rawMessage = createMimeMessage(options.to, options.subject, options.html);
    
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: rawMessage,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Gmail API sending failed:", error);
  }
};

// Send email when admin approves or rejects an education record
export const sendEducationStatusEmail = async (citizenEmail, citizenName, recordDetails, status) => {
  const subject = `Education Record ${status} - eBangla Identity`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: ${status === "Verified" ? "#2e7d32" : "#d32f2f"};">${status === "Verified" ? "Qualification Approved" : "Qualification Rejected"}</h2>
      <p>Hello <strong>${citizenName}</strong>,</p>
      <p>Your educational qualification for <strong>${recordDetails.qualification}</strong> at <strong>${recordDetails.institution}</strong> has been <strong>${status.toLowerCase()}</strong> by the administrator.</p>
      <br />
      <p>Best regards,<br />eBangla Identity Team</p>
    </div>
  `;

  return sendEmail({ to: citizenEmail, subject, html });
};

// Send email when admin adds an education record directly
export const sendAdminAddedEducationEmail = async (citizenEmail, citizenName, recordDetails) => {
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
      <br />
      <p>Best regards,<br />eBangla Identity Team</p>
    </div>
  `;

  return sendEmail({ to: citizenEmail, subject, html });
};

// Send email for tax status changes 
export const sendTaxStatusEmail = async (citizenEmail, citizenName, recordDetails, status) => {
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
