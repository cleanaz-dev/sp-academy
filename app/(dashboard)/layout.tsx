// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";

import DashboardClientLayout from "@/components/dashboard/DashboardLayout";
import { SpriteProvider } from "@/context/sprite-context";
import { requireUser, hasActiveAccess } from "@/lib/auth-guard";
import { getUserSprite } from "@/lib/sprites/get-user-sprite";
import { S3Provider } from "@/context/s3-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";

  const [hasAccess, spriteData] = await Promise.all([
    hasActiveAccess(user.id), // returns true for admins
    getUserSprite(user.id),
  ]);

  if (!hasAccess) {
    redirect("/verify?type=subscription-required");
  }

  return (
    <DashboardClientLayout isAdmin={isAdmin}>
      <S3Provider>
        <SpriteProvider spriteData={spriteData}>{children}</SpriteProvider>
      </S3Provider>
    </DashboardClientLayout>
  );
}
