import { notFound } from "next/navigation";
import { getProblemDetailsAction, getProblemSubmissionsAction } from "@/actions/student-actions";
import { SplitPaneWorkspace, ProblemData } from "@/components/student/SplitPaneWorkspace";
import { TopNav } from "@/components/ui/TopNav";
import { HistoricalSubmission } from "@/components/student/SubmissionHistoryViewer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const result = await getProblemDetailsAction(slug);
  if (!result.success || !result.data) {
    return { title: "Problem Not Found" };
  }
  const title = (result.data as any).title || "Problem Workspace";
  return {
    title: `${title} | Practice Workspace`,
    description: `Solve ${title} in Python, C++, Java, or JavaScript.`,
  };
}

import { getSession } from "@/lib/session";

export default async function ProblemWorkspacePage({ params }: PageProps) {
  const { slug } = await params;

  const [result, session] = await Promise.all([
    getProblemDetailsAction(slug),
    getSession(),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const problem: ProblemData = result.data as any;

  // Fetch past student submissions for this problem
  const subResult = await getProblemSubmissionsAction(problem.id);
  const submissions: HistoricalSubmission[] = subResult.success && subResult.data ? (subResult.data as any) : [];

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
        overflow: "hidden",
      }}
    >
      <TopNav user={session} />
      <main style={{ flex: 1, overflow: "hidden" }}>
        <SplitPaneWorkspace problem={problem} initialSubmissions={submissions} />
      </main>
    </div>
  );

}
