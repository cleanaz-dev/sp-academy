import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // full log with indent
    const logBody = JSON.stringify(body, null, 2);
    console.log("Received webhook payload:", logBody);

    // Here you can add logic to process the webhook payload as needed

    return NextResponse.json(
      { message: "Webhook received successfully" },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
