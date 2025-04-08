// app/admin/page.js

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="justify-center-screen flex flex-col items-center p-6">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {/* Dashboard options */}
        <Link
          href="/admin/emails"
          className="flex flex-col items-center justify-center rounded-lg border border-gray-300 p-6 shadow-lg"
        >
          <h2 className="mb-4 text-xl font-semibold">Email Manager</h2>
          <p className="text-center">
            Manage your email templates for notifications and marketing.
          </p>
        </Link>

        <Link
          href="/admin/generate"
          className="flex flex-col items-center justify-center rounded-lg border border-gray-300 p-6 shadow-lg"
        >
          <h2 className="mb-4 text-xl font-semibold">Generate New Content</h2>
          <p className="text-center">
            Create and manage new content like blog posts or campaigns.
          </p>
        </Link>

        <Link
          href="/admin/settings"
          className="flex flex-col items-center justify-center rounded-lg border border-gray-300 p-6 shadow-lg"
        >
          <h2 className="mb-4 text-xl font-semibold">Settings</h2>
          <p className="text-center">
            Update your admin settings and configure the application.
          </p>
        </Link>
      </div>
    </div>
  );
}
