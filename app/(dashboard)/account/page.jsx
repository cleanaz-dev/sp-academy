// app/account/page.tsx
import React from "react";
import { getAccountSettingsByUserId } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";
import { Cog } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AccountSettingsForm } from "@/components/account/AccountSettingsForm";
import { BillingForm } from "@/components/account/BillingForm";
import { SharingSettingsForm } from "@/components/account/SharingSettingsForm";
import { NotificationSettingsForm } from "@/components/account/NotificationSettingsForm";
import { ProfilePictureUploader } from "@/components/account/ProfilePictureUploader";
import { DangerZone } from "@/components/account/DangerZone";
import { ProfileCompletion } from "@/components/account/ProfileCompletion";
import { GeneralSettings } from "@/components/account/GeneralSettings";

export default async function AccountSettings() {
  const { userId } = auth();
  const settings = await getAccountSettingsByUserId(userId);

  return (
    <main className="space-y-4 pb-10">
      <header className="mb-8 animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="mb-4 flex items-center gap-4 text-4xl font-bold">
            Account Settings{" "}
            <Cog
              strokeWidth={1.5}
              className="size-10 animate-spin drop-shadow-xl transition-all duration-1000 ease-in-out"
            />
          </h1>
          <p className="text-xl opacity-90">
            Manage your account preferences and settings
          </p>
        </div>
      </header>

      <Card className="container mx-auto max-w-5xl p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid h-12 w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <GeneralSettings
              initialImageUrl={settings.avatarUrl}
              initialSettings={settings}
            />

            <DangerZone userId={userId} />
          </TabsContent>

          <TabsContent value="sharing">
            <SharingSettingsForm initialSettings={settings} userId={userId} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettingsForm
              initialSettings={settings}
              userId={userId}
            />
          </TabsContent>

          <TabsContent value="billing">
            <BillingForm currentBillingPlan={settings} userId={userId} />
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
}

function calculateCompletion(settings) {
  // Calculate profile completion percentage based on filled fields
  const totalFields = 100; // Adjust based on your fields
  const filledFields = Object.values(settings).filter(Boolean).length;
  return Math.round((filledFields / totalFields) * 100);
}
