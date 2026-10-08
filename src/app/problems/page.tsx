import { getStudentProblemsAction } from "@/actions/student-actions";
import { ProblemCatalogTable, CatalogProblem } from "@/components/student/ProblemCatalogTable";
import { TopNav } from "@/components/ui/TopNav";
import { Code2, Sparkles } from "lucide-react";

import { getSession } from "@/lib/session";

export const metadata = {
  title: "Problem Catalog | DSA Platform",
  description: "Browse, filter, and practice Data Structures & Algorithms coding problems.",
};

export default async function ProblemsPage() {
  const [result, session] = await Promise.all([
    getStudentProblemsAction(),
    getSession(),
  ]);
  const problems: CatalogProblem[] = result.success && result.data ? result.data : [];

  // Collect all unique tags across problems
  const allTags = Array.from(
    new Set(problems.flatMap((p) => p.tags))
  ).sort();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <TopNav user={session} />

      <main
        style={{
          flex: 1,
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        {/* Header Title Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            borderBottom: "1px solid #262626",
            paddingBottom: "24px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#34d399",
                fontFamily: "monospace",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              <Code2 style={{ width: 14, height: 14 }} />
              <span>Practice Workspace</span>
            </div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              DSA Problem Catalog
            </h1>
            <p style={{ fontSize: "14px", color: "#a3a3a3", marginTop: "4px" }}>
              Sharpen your algorithmic problem solving skills across Python, C++,
              Java, and JavaScript.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(10,10,10,0.8)",
              border: "1px solid #262626",
              fontSize: "13px",
              color: "#d4d4d4",
              alignSelf: "flex-start",
            }}
          >
            <Sparkles style={{ width: 15, height: 15, color: "#fbbf24", flexShrink: 0 }} />
            <div>
              <span style={{ fontWeight: 700, color: "#fff" }}>{problems.length}</span>{" "}
              Total Problems Available
            </div>
          </div>
        </div>

        {/* Catalog Table Component */}
        <ProblemCatalogTable
          initialProblems={problems}
          allTags={allTags}
          onFilterChange={async (params) => {
            "use server";
            return getStudentProblemsAction(params);
          }}
        />
      </main>
    </div>
  );

}
