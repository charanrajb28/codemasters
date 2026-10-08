import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Code2, Cpu, ShieldAlert, Zap, Terminal, ArrowRight, CheckCircle2, Flame, Award, Play } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getStudentProblemsAction } from "@/actions/student-actions";

export default async function DashboardPage() {
  const session = await getSession();
  const res = await getStudentProblemsAction().catch(() => ({ success: false, data: [] }));
  const problems = res?.success && Array.isArray(res.data) ? res.data : [];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Top Welcome Banner */}
      <div
        style={{
          borderRadius: "var(--radius-lg)",
          padding: "36px",
          background: "radial-gradient(ellipse at top left, rgba(52, 211, 153, 0.15) 0%, rgba(9, 9, 11, 0.95) 70%)",
          border: "1px solid var(--border-bright)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <Badge variant="success">KUBERNETES EKS RUNTIME</Badge>
              <Badge variant="info">SESSION ACTIVE</Badge>
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
              Welcome back, {session?.name || session?.email || "Engineer"} 👋
            </h1>
            <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Ready to execute code in isolated pods? Select a problem to start solving.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/problems">
              <Button variant="primary" size="lg" icon={<Code2 size={18} />}>
                Solve Problems
              </Button>
            </Link>
            {session?.role === "ADMIN" && (
              <Link href="/admin">
                <Button variant="outline" size="lg" icon={<ShieldAlert size={18} style={{ color: "#fbbf24" }} />}>
                  Admin Panel
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* User Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <Card>
          <CardContent style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(52, 211, 153, 0.1)", border: "1px solid rgba(52, 211, 153, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                Available Challenges
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff" }}>
                {problems.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24" }}>
              <Flame size={24} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                Active Streak
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff" }}>
                1 Day
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(96, 165, 250, 0.1)", border: "1px solid rgba(96, 165, 250, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
              <Cpu size={24} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                Execution Memory Limit
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff" }}>
                256 MB
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a855f7" }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                Account Tier
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>
                {session?.role || "STUDENT"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Problems Preview */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff" }}>
            Featured Coding Problems
          </h2>
          <Link href="/problems" style={{ fontSize: "14px", color: "#34d399", textDecoration: "none", fontWeight: 600 }}>
            View All Problems &rarr;
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {problems.length === 0 ? (
            <Card style={{ padding: "32px", textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)" }}>No problems available yet.</p>
            </Card>
          ) : (
            problems.slice(0, 3).map((problem) => (
              <Card key={problem.id} glass style={{ border: "1px solid var(--border-bright)" }}>
                <CardHeader>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Badge variant={problem.difficulty === "Easy" ? "success" : problem.difficulty === "Medium" ? "warning" : "error"}>
                      {problem.difficulty}
                    </Badge>
                    <span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-secondary)" }}>
                      {(problem as any).timeLimit ?? 2000}ms limit
                    </span>
                  </div>
                  <CardTitle style={{ fontSize: "18px", marginTop: "10px" }}>{problem.title}</CardTitle>
                  <CardDescription style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                    {problem.tags.map((tag: string) => (
                      <span key={tag} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", backgroundColor: "#1c1c1c", color: "#a3a3a3", border: "1px solid #333" }}>
                        {tag}
                      </span>
                    ))}
                  </CardDescription>
                </CardHeader>
                <CardFooter style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                  <Link href={`/problems/${problem.slug}`}>
                    <Button variant="primary" size="sm" icon={<Play size={14} />}>
                      Solve Challenge
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
