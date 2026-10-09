// app/dashboard/layout.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/verify?type=sign-in");
  }

  if (session.user.role !== "ADMIN") {
    const billing = await prisma.billingInformation.findUnique({
      where: { userId: session.user.id },
      select: { isActive: true },
    });
    
    if (!billing?.isActive) {
      redirect("/verify?type=subscription-required");
    }
  }

  return <>{children}</>;
}