"use client";

import DashboardLayout from "../../components/dashboard-layout";
// Import the CSS file

export default function Layout({ children }) {
  return (
    <div>
      <DashboardLayout>
          {children}
      </DashboardLayout>
    </div>
  );
}
