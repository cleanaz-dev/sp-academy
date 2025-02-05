//app/api/email/weekly-update/route.js
import { NextResponse } from "next/server";
export async function POST(request) {
  try {
    const data = await request.json();
    // Process the data here
    console.log("Data received from the Improvement API: ", data);
    return NextResponse.json(
      { message: "Data processed successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing data:", error.message);
    return NextResponse.json(
      { error: "An error occurred while processing data." },
      { status: 500 }
    );
  }
}
