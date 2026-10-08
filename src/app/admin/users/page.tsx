import React from "react";
import { getUsersAction } from "@/actions/admin-actions";
import { UserTable } from "@/components/admin/UserTable";
import { Button } from "@/components/ui/Button";
import { Users, Code2, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getUsersAction();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={28} /> User & Access Management
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Manage user roles, monitor submission activity, and control platform access permissions.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/admin/problems">
            <Button variant="secondary" size="md" icon={<Code2 size={16} />}>
              Manage Problems
            </Button>
          </Link>
          <Link href="/admin/problems/new">
            <Button variant="primary" size="md" icon={<Plus size={16} />}>
              Create Problem
            </Button>
          </Link>
        </div>
      </div>

      <UserTable initialUsers={users} />
    </div>
  );
}
