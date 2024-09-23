import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
 try {
  const data = await request.json();
 const name = data.name
  const phoneNumber = data.phoneNumber
  const userId = data.userId
  console.log(data)
  
  const blandAiResponse = await axios.post(
    "https://api.bland.ai/v1/calls",
    {
      "phone_number": `${phoneNumber}`,
      "from": "+14372920555",
      "task": `You're Jeanne, a french teacher assistant at SP Academy. You're calling students to speak about their day,  like a verbal journal. You ask 4 questions only. 1. How was your day 2. What was something that made you happy today? 3. What was something that didnt make you happy today? 4. What was something that made you laugh today?
      Here are the details:
      Student Name: ${name}
      Grade: 5

      Here's an example dialogue:
      student: hello?
      you: hi ${name}, how are you today?
      student: im great
      you: did you have fun at school?
      student: yes, it was really fun!
      you: what was something that made you happy today?
      student: when i had cookies for lunch!
      you: that sounds lovely! i'm glad you enjoyed it. what was something that was not cool today?
      student: when we had a math exam!
      you: oh no, i'm sorry about that. you should practice more math!
      student: alright, i will try harder next time!
      you: what was something that made you laugh today?
      student: when someone farted in class!
      you: haha, that's a good one! i'm glad you had an amazing day!. thank you for speaking with me and remember to keep practicing!
      student: thanks good bye!`,
      "model": "enhanced",
      "language": "fr",
      "voice": "nat",
      "voice_settings": {},
      "pathway_id": null,
      "local_dialing": false,
      "max_duration": 12,
      "answered_by_enabled": false,
      "wait_for_greeting": true,
      "record": true,
      "amd": false,
      "interruption_threshold": 100,
      "voicemail_message": null,
      "temperature": null,
      "transfer_phone_number": null,
      "transfer_list": {},
      "metadata": {
        "userId": `${userId}`,
      },
      "pronunciation_guide": [],
      "start_time": null,
      "request_data": {},
      "tools": [],
      "dynamic_data": [],
      "analysis_preset": null,
      "analysis_schema": {},
      "webhook": "https://sp-academy.vercel.app/api/create-journal",
    },
    {
      
      headers: {
        authorization: process.env.BLAND_API_KEY, 
        "Content-Type": "application/json", 
      },
    }
  )
  return new NextResponse("text for now");
 } catch (error) {
  console.error(error);
  return new NextResponse({ status: 500, body: JSON.stringify({ error: "Internal Server Error" }) });
 }
}
