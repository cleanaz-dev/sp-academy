"use client";

import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </div>
  );
}