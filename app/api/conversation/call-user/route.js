import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const data = await request.json();
    const { phoneNumber, userId, journalId, scenarioContext } = data;

    await axios.post(
      "https://api.bland.ai/v1/calls",
      {
        phone_number: phoneNumber,
        from: "+14372920555",
        task: `You're Jeanne, a French teacher assistant at SP Academy. You're calling students to have a conversation based on the following scenario context:
        
        ${scenarioContext}
        
        Create a dialogue based on the given scenario context. Make sure to include a goodbye message at the end.`,
        model: "enhanced",
        language: "fr",
        voice: "nat",
        voice_settings: {},
        pathway_id: null,
        local_dialing: false,
        max_duration: 12,
        answered_by_enabled: false,
        wait_for_greeting: true,
        record: true,
        amd: false,
        interruption_threshold: 130,
        voicemail_message: null,
        temperature: null,
        transfer_phone_number: null,
        transfer_list: {},
        metadata: {
          userId: userId,
        },
        pronunciation_guide: [],
        start_time: null,
        request_data: {},
        tools: [],
        dynamic_data: [],
        analysis_preset: null,
        analysis_schema: {},
        webhook: " https://yt-booking.ngrok.app/api/conversation/after-call",
      },
      {
        headers: {
          authorization: process.env.BLAND_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return new NextResponse(JSON.stringify({ success: true, message: "Call initiated successfully" }));
  } catch (error) {
    console.error("Error in Journal API:", error);
    return new NextResponse(JSON.stringify({ success: false, error: error.message }));
  }
}