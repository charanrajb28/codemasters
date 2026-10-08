import React from "react";
import { getTelemetryStatsAction } from "@/actions/admin-actions";
import { TelemetryCharts } from "@/components/admin/TelemetryCharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Shield, Activity, Users, Cpu, CheckCircle2, Plus, Code2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const telemetry = await getTelemetryStatsAction();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "10px" }}>
            <Shield size={28} /> Admin Portal Overview
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time execution metrics, user management, and problem configuration telemetry.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/admin/problems">
            <Button variant="secondary" size="md" icon={<Code2 size={16} />}>
              Manage Problems
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline" size="md" icon={<Users size={16} />}>
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/problems/new">
            <Button variant="primary" size="md" icon={<Plus size={16} />}>
              Create Problem
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        <Card>
          <CardHeader style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Total Submissions</span>
              <Activity size={18} color="var(--text-muted)" />
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#ffffff", marginTop: "6px" }}>
              {telemetry.kpis.totalSubmissions}
            </div>
          </CardHeader>
          <CardContent>
            <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 500 }}>+14.2% from last week</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Acceptance Rate</span>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#ffffff", marginTop: "6px" }}>
              {telemetry.kpis.acceptanceRate}
            </div>
          </CardHeader>
          <CardContent>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Average across all challenges</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Active Users</span>
              <Users size={18} color="var(--text-muted)" />
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#ffffff", marginTop: "6px" }}>
              {telemetry.kpis.activeUsers}
            </div>
          </CardHeader>
          <CardContent>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Registered platform accounts</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Sandbox Execution Engine</span>
              <Cpu size={18} color="#60a5fa" />
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#10b981", marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
              {telemetry.kpis.queueHealth}
            </div>
          </CardHeader>
          <CardContent>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Vercel Sandbox microVMs active</span>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Recharts Section */}
      <TelemetryCharts verdictData={telemetry.verdictData} volumeData={telemetry.volumeData} />
    </div>
  );
}
