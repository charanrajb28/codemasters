import React from "react";
import DashboardLayout from "@/app/(dashboard)/layout";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>
          <AdminSidebar />
          <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
            {children}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
