//api/email/template/save/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const user = await prisma.user.findFirst({ where: { userId: userId } });

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You are not an admin" },
        { status: 403 },
      );
    }
    const { subject, content, designHtml, templateName, handlebarsType } =
      await request.json();
    console.log("Data from email template save API:", {
      subject,
      content,
      designHtml,
      templateName,
    });

    const emailTemplate = await prisma.emailTemplate.create({
      data: {
        handlebarsType,
        templateName,
        subject,
        content,
        designHtml,
      },
    });
    console.log("email template created successfully! ID: ", emailTemplate.id);
    return NextResponse.json({ message: "" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
