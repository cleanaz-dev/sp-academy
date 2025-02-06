

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend
 * @param {string} to - Recipient's email
 * @param {string} subject - Email subject
 * @param {React.ReactElement} reactComponent - React component for email body
 * @returns {Promise<Object>} - Resend API response
 */
export async function sendEmail(to, subject, reactComponent) {
  try {
    const response = await resend.emails.send({
      from: "your@email.com", // Use your verified sender email
      to,
      subject,
      react: reactComponent,
    });

    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}
