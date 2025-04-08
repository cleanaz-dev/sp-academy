import { NextResponse } from "next/server";
import { Resend } from "resend";
import Bottleneck from "bottleneck";
import juice from "juice"; // For inlining CSS

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Create a Bottleneck limiter
const limiter = new Bottleneck({
  minTime: 12000, // 12 seconds between requests (5 requests per minute)
  maxConcurrent: 1, // Only 1 request at a time
});

export async function POST(request) {
  try {
    const { subject, content, testEmail } = await request.json();

    // Validate input data
    if (!subject || !content || !testEmail) {
      return NextResponse.json(
        { error: "Missing required fields (subject, content, or testEmail)" },
        { status: 400 },
      );
    }

    if (!testEmail.includes("@")) {
      return NextResponse.json(
        { error: "Invalid test email address" },
        { status: 400 },
      );
    }

    // Inline CSS styles for email compatibility
    const inlinedContent = juice(content);

    // Log the email-sending activity
    console.log(`Sending test email to ${testEmail} with subject: ${subject}`);
    console.log("Inlined Content:", inlinedContent); // Debugging

    // Use Bottleneck to rate-limit the email-sending function
    const sendEmail = limiter.wrap(async () => {
      const { data, error } = await resend.emails.send({
        from:
          process.env.RESEND_SENDER_EMAIL ||
          "Your App <no-reply@yourdomain.com>",
        to: testEmail,
        subject: subject,
        html: inlinedContent,
      });

      if (error) {
        console.error("Resend error:", error);
        throw new Error(error.message);
      }

      return data;
    });

    // Execute the rate-limited function
    const data = await sendEmail();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send test email" },
      { status: 500 },
    );
  }
}
