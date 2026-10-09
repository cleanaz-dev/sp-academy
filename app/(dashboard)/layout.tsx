// app/(dashboard)/layout.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import DashboardClientLayout from "@/components/dashboard/DashboardLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/verify?type=sign-in");
  }

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin) {
    const billing = await prisma.billingInformation.findUnique({
      where: { userId: session.user.id },
      select: { isActive: true },
    });
    
    if (!billing?.isActive) {
      redirect("/verify?type=subscription-required");
    }
  }

  // ✅ Pass isAdmin down directly
  return (
    <DashboardClientLayout isAdmin={isAdmin}>
      {children}
    </DashboardClientLayout>
  );
}