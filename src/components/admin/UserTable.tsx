"use client";

import React, { useState, useTransition } from "react";
import { updateUserRoleAction, toggleUserSuspensionAction } from "@/actions/admin-actions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, Shield, User, Ban, CheckCircle } from "lucide-react";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: "STUDENT" | "ADMIN";
  isSuspended: boolean;
  createdAt: Date | string;
  submissionCount?: number;
  _count?: {
    submissions: number;
  };
}

interface UserTableProps {
  initialUsers: UserItem[];
}

export const UserTable: React.FC<UserTableProps> = ({ initialUsers }) => {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (userId: string, newRole: "STUDENT" | "ADMIN") => {
    startTransition(async () => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      await updateUserRoleAction(userId, newRole);
    });
  };

  const handleToggleSuspension = (userId: string) => {
    startTransition(async () => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isSuspended: !u.isSuspended } : u))
      );
      await toggleUserSuspensionAction(userId);
    });
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Controls Bar */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "var(--bg-card)",
              color: "#ffffff",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px 10px 38px",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            backgroundColor: "var(--bg-card)",
            color: "#ffffff",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 16px",
            fontSize: "14px",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table Container */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#171717", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "14px 20px" }}>User</th>
              <th style={{ padding: "14px 20px" }}>Role</th>
              <th style={{ padding: "14px 20px" }}>Status</th>
              <th style={{ padding: "14px 20px" }}>Submissions</th>
              <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                  No users found matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid var(--border-color)", opacity: user.isSuspended ? 0.6 : 1 }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 600, color: "#ffffff" }}>{user.name || "Anonymous User"}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{user.email}</div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <select
                      value={user.role}
                      disabled={isPending}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as "STUDENT" | "ADMIN")}
                      style={{
                        backgroundColor: "#1c1c1c",
                        color: user.role === "ADMIN" ? "#fbbf24" : "#ffffff",
                        border: "1px solid var(--border-bright)",
                        borderRadius: "var(--radius-sm)",
                        padding: "6px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    {user.isSuspended ? (
                      <Badge variant="error">Suspended</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </td>
                  <td style={{ padding: "16px 20px", color: "var(--text-secondary)", fontWeight: 500 }}>
                    {user.submissionCount ?? user._count?.submissions ?? 0} submissions
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <Button
                      variant={user.isSuspended ? "outline" : "danger"}
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleToggleSuspension(user.id)}
                      icon={user.isSuspended ? <CheckCircle size={14} /> : <Ban size={14} />}
                    >
                      {user.isSuspended ? "Reactivate" : "Suspend"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
