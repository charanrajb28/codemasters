import React from "react";
import { getSession } from "@/lib/session";
import { getAllUserSubmissionsAction } from "@/actions/student-actions";
import { SubmissionHistoryViewer } from "@/components/student/SubmissionHistoryViewer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { History, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function SubmissionsPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center" }}>
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your submission history.</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "flex", justifyContent: "center", gap: "12px", paddingTop: "16px" }}>
            <Link href="/login">
              <Button variant="primary">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const res = await getAllUserSubmissionsAction();
  const submissions = (res.success && Array.isArray(res.data) ? res.data : []) as any[];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "10px" }}>
          <History style={{ color: "#34d399", width: 28, height: 28 }} />
          Submission History
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          View all your code executions and assessment results across problems.
        </p>
      </div>

      <SubmissionHistoryViewer submissions={submissions} />
    </div>
  );
}
