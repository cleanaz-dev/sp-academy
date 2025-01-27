
import React from 'react'
import { AccountSettingsForm } from '@/components/account-settings/AccountSettingsForm'
import { getAccountSettingsByUserId } from '@/lib/actions'
import { auth } from '@clerk/nextjs/server'

export default async function AccountSettings() {
  const { userId } = auth()
  const settings = await getAccountSettingsByUserId(userId)

  return (
    <div>
      <header>
        <h1 className="header-title">Account Settings</h1>
      </header>
      <AccountSettingsForm initialSettings={settings} userId={userId}/>
      </div>
  )
}
