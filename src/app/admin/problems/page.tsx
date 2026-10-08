import React from "react";
import { getAdminProblemsAction, AdminProblemItem } from "@/actions/problem-actions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Code2, Plus, Edit3, Clock, Database, Users } from "lucide-react";
import Link from "next/link";
import { DeleteProblemButton } from "@/components/admin/DeleteProblemButton";

export const dynamic = "force-dynamic";

export default async function AdminProblemsPage() {
  const problems: AdminProblemItem[] = await getAdminProblemsAction();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "10px" }}>
            <Code2 size={28} /> Problem Authoring Suite
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Create, edit, and configure DSA coding challenges, test cases, and execution constraints.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/admin/users">
            <Button variant="outline" size="md" icon={<Users size={16} />}>
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/problems/new">
            <Button variant="primary" size="md" icon={<Plus size={16} />}>
              Create New Problem
            </Button>
          </Link>
        </div>
      </div>

      {/* Problem List Table */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#171717", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "14px 20px" }}>Title & Slug</th>
              <th style={{ padding: "14px 20px" }}>Difficulty</th>
              <th style={{ padding: "14px 20px" }}>Limits</th>
              <th style={{ padding: "14px 20px" }}>Test Cases</th>
              <th style={{ padding: "14px 20px" }}>Submissions</th>
              <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                  No problems created yet. Click "Create New Problem" to author your first challenge.
                </td>
              </tr>
            ) : (
              problems.map((problem: AdminProblemItem) => (
                <tr key={problem.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 600, color: "#ffffff" }}>{problem.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      /{problem.slug}
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <Badge
                      variant={
                        problem.difficulty === "Easy"
                          ? "success"
                          : problem.difficulty === "Medium"
                          ? "warning"
                          : "error"
                      }
                    >
                      {problem.difficulty}
                    </Badge>
                  </td>
                  <td style={{ padding: "16px 20px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} /> {problem.timeLimit}ms
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Database size={12} /> {problem.memoryLimit}MB
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", color: "var(--text-secondary)", fontWeight: 500 }}>
                    {problem._count.testCases} test cases
                  </td>
                  <td style={{ padding: "16px 20px", color: "var(--text-secondary)", fontWeight: 500 }}>
                    {problem._count.submissions} submissions
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <Link href={`/admin/problems/${problem.id}/edit`}>
                        <Button variant="outline" size="sm" icon={<Edit3 size={14} />}>
                          Edit
                        </Button>
                      </Link>
                      <DeleteProblemButton problemId={problem.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
