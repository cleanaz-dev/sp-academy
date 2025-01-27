import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("data:", data);
    return NextResponse.json({ message: "Data received successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "An error occurred while processing the request" }, { status: 500 });
  }
}