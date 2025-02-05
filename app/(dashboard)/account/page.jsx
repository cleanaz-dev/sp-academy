import React from "react";
import { AccountSettingsForm } from "@/components/account/AccountSettingsForm";
import { getAccountSettingsByUserId } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";
import { BillingForm } from "@/components/account/BillingForm";

export default async function AccountSettings() {
  const { userId } = auth();
  const settings = await getAccountSettingsByUserId(userId);

  return (
    <main className="max-w-3xl space-y-4">
      <header>
        <h1 className="header-title">Account Settings</h1>
      </header>
      <AccountSettingsForm initialSettings={settings} userId={userId} />
      <BillingForm currentBillingPlan={settings} userId={userId} />
    </main>
  );
}
