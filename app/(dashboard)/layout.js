"use client";

import DashboardLayout from "../../components/dashboard-layout";


export default function layout({ children }) {
 return (
  <div>
    <DashboardLayout>{children}</DashboardLayout>
  </div>
 );
}
