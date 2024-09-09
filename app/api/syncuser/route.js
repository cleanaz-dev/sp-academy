import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request) {
  try {
    const body = await request.json();

    const name = body.data.first_name;
    const email = body.data.email_addresses[0].email_address;
    const userId = body.data.id;

    const user = {
      userId: userId,
      name: name,
      email: email,
    }
    const createdUser = await prisma.user.create({
      data: user,
    })
    
    return new NextResponse({ status: 200, body: JSON.stringify(createdUser) }  );
   
  } catch (error) {
    console.error(error);
    return new NextResponse({ status: 500, body: JSON.stringify({ error: 'Internal Server Error' }) });
  }
}
