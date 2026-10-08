"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Clock,
  BookOpen,
  Play,
  Send,
  ChevronUp,
  ChevronDown,
  Sparkles,
  GripVertical,
  GripHorizontal,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MonacoCodeEditor, SupportedLanguage, STARTER_TEMPLATES } from "@/components/student/MonacoCodeEditor";
import { TestConsoleDrawer, SampleTestResult } from "@/components/student/TestConsoleDrawer";
import { SubmissionVerdictView, SubmissionVerdictData } from "@/components/student/SubmissionVerdictModal";
import { SubmissionHistoryViewer, HistoricalSubmission } from "@/components/student/SubmissionHistoryViewer";
import { ProblemDescriptionFormatter } from "@/components/student/ProblemDescriptionFormatter";
import {
  runSampleTestCasesAction,
  submitSolutionAction,
  getSubmissionStatusAction,
  getProblemSubmissionsAction,
} from "@/actions/student-actions";

export interface ProblemData {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  memoryLimit: number;
  tags: string[];
  paramCount?: number;
  paramNames?: string[];
  jsRunner?: string;
  jsChecker?: string;
  testCases: { id: string; input: string; output: string }[];
  templates?: {
    python?: { starterCode: string; driverCode: string };
    cpp?: { starterCode: string; driverCode: string };
    java?: { starterCode: string; driverCode: string };
    javascript?: { starterCode: string; driverCode: string };
  };
}

interface SplitPaneWorkspaceProps {
  problem: ProblemData;
  initialSubmissions: HistoricalSubmission[];
}

export function SplitPaneWorkspace({ problem, initialSubmissions }: SplitPaneWorkspaceProps) {
  const [activeLeftTab, setActiveLeftTab] = useState<"description" | "submissions" | "editorial" | "result">("description");
  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [code, setCode] = useState<string>(STARTER_TEMPLATES.python);
  const [customInput, setCustomInput] = useState<string>("");

  // Resizable Pane Sizes
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(42);
  const [consoleHeightPx, setConsoleHeightPx] = useState<number>(260);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Drawer & Execution States
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<SampleTestResult[] | null>(null);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatusText, setSubmitStatusText] = useState<string>("Submit Solution");
  const [submissionsList, setSubmissionsList] = useState<HistoricalSubmission[]>(initialSubmissions);
  const [latestVerdict, setLatestVerdict] = useState<SubmissionVerdictData | null>(null);
  const submitPollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitLockRef = useRef(false);

  useEffect(() => () => {
    if (submitPollTimeoutRef.current) clearTimeout(submitPollTimeoutRef.current);
  }, []);

  // Sync jsRunner and jsChecker with localStorage
  const [activeJsRunner, setActiveJsRunner] = useState<string>(problem.jsRunner || "");
  const [activeJsChecker, setActiveJsChecker] = useState<string>(problem.jsChecker || "");

  useEffect(() => {
    if (typeof window === "undefined" || !problem.id) return;
    const runnerKey = `codemasters_js_runner_${problem.id}`;
    const checkerKey = `codemasters_js_checker_${problem.id}`;

    const cachedRunner = localStorage.getItem(runnerKey);
    const cachedChecker = localStorage.getItem(checkerKey);

    if (cachedRunner) {
      setActiveJsRunner(cachedRunner);
    } else if (problem.jsRunner) {
      localStorage.setItem(runnerKey, problem.jsRunner);
    }

    if (cachedChecker) {
      setActiveJsChecker(cachedChecker);
    } else if (problem.jsChecker) {
      localStorage.setItem(checkerKey, problem.jsChecker);
    }
  }, [problem.id, problem.jsRunner, problem.jsChecker]);

  // Handle Horizontal Drag (Left vs Right Pane Width)
  const handleHorizontalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidthPercent;
    const containerWidth = workspaceRef.current?.offsetWidth || window.innerWidth;

    setIsDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newWidth = Math.min(Math.max(startWidth + deltaPercent, 20), 75);
      setLeftWidthPercent(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      setIsDragging(false);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // Handle Vertical Drag (Editor vs Console Height)
  const handleVerticalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = consoleHeightPx;

    setIsDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY; // dragging up increases console height
      const newHeight = Math.min(Math.max(startHeight + deltaY, 120), 550);
      setConsoleHeightPx(newHeight);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      setIsDragging(false);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return <Badge variant="success">Easy</Badge>;
      case "medium":
        return <Badge variant="warning">Medium</Badge>;
      case "hard":
        return <Badge variant="error">Hard</Badge>;
      default:
        return <Badge variant="neutral">{diff}</Badge>;
    }
  };

  // Handle Run Code against sample test cases
  const handleRunCode = async (customIn?: string | string[]) => {
    setIsRunningTests(true);
    setIsDrawerOpen(true);

    try {
      const res = await runSampleTestCasesAction(problem.id, language, code, customIn);
      if (res.success && res.data) {
        setTestResults(res.data.results as SampleTestResult[]);
      }
    } catch (err) {
      console.error("Run code error:", err);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Handle Submit Solution
  const handleSubmit = async () => {
    if (submitLockRef.current || isSubmitting || isRunningTests) return;
    submitLockRef.current = true;
    setIsSubmitting(true);
    setSubmitStatusText("Queued...");

    try {
      const res = await submitSolutionAction(problem.id, language, code);
      if (!res.success || !res.data) {
        alert(res.error || "Submission failed");
        setIsSubmitting(false);
        setSubmitStatusText("Submit Solution");
        submitLockRef.current = false;
        return;
      }

      const { submissionId } = res.data;
      setSubmitStatusText("Running...");

      // Poll sequentially so slow requests cannot overlap.
      const pollSubmission = async () => {
        const statusRes = await getSubmissionStatusAction(submissionId);
        if (statusRes.success && statusRes.data) {
          const statusData = statusRes.data;
          if (statusData.status !== "QUEUED" && statusData.status !== "RUNNING") {
            setIsSubmitting(false);
            setSubmitStatusText("Submit Solution");
            submitLockRef.current = false;

            // Save verdict and automatically open Result tab in Left Pane!
            setLatestVerdict(statusData);
            setActiveLeftTab("result");

            // Refresh submissions list
            const subRes = await getProblemSubmissionsAction(problem.id);
            if (subRes.success && subRes.data) {
              setSubmissionsList(subRes.data as any);
            }
            return;
          }
        }
        submitPollTimeoutRef.current = setTimeout(() => {
          void pollSubmission();
        }, 1000);
      };

      await pollSubmission();
    } catch (err) {
      console.error("Submit error:", err);
      setIsSubmitting(false);
      setSubmitStatusText("Submit Solution");
      submitLockRef.current = false;
    }
  };

  const leftTabActiveStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: "#262626",
    color: "#ffffff",
    border: "1px solid #404040",
    cursor: "pointer",
    transition: "all 0.15s ease",
  };

  const leftTabInactiveStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 500,
    backgroundColor: "transparent",
    color: "#a3a3a3",
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "all 0.15s ease",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        backgroundColor: "#000000",
        color: "#ffffff",
        fontFamily: "var(--font-sans), 'Inter', sans-serif",
        overflow: "hidden",
        userSelect: isDragging ? "none" : "auto",
      }}
    >
      {/* Workspace Sub-Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          backgroundColor: "#09090b",
          borderBottom: "1px solid #262626",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.01em" }}>
            {problem.title}
          </h1>
          {getDifficultyBadge(problem.difficulty)}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "2px 8px",
              borderRadius: "4px",
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              fontSize: "11px",
              fontFamily: "monospace",
              color: "#a1a1aa",
            }}
          >
            <Clock style={{ width: 13, height: 13, color: "#a1a1aa" }} />
            <span>{problem.timeLimit}ms limit</span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => handleRunCode()}
            disabled={isRunningTests || isSubmitting}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--font-sans), sans-serif",
              backgroundColor: "#18181b",
              color: "#ffffff",
              border: "1px solid #3f3f46",
              cursor: isRunningTests || isSubmitting ? "not-allowed" : "pointer",
              opacity: isRunningTests || isSubmitting ? 0.6 : 1,
              transition: "all 0.15s ease",
            }}
          >
            <Play style={{ width: 14, height: 14, color: "#34d399", fill: "currentColor" }} />
            <span>{isRunningTests ? "Running..." : "Run Code"}</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isRunningTests}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "var(--font-sans), sans-serif",
              backgroundColor: "#10b981",
              color: "#000000",
              border: "none",
              cursor: isSubmitting || isRunningTests ? "not-allowed" : "pointer",
              opacity: isSubmitting || isRunningTests ? 0.6 : 1,
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
              transition: "all 0.15s ease",
            }}
          >
            <Send style={{ width: 14, height: 14 }} />
            <span>{isSubmitting ? submitStatusText : "Submit Solution"}</span>
          </button>
        </div>
      </div>

      {/* Main Split-Pane Workspace (Scalable) */}
      <div
        ref={workspaceRef}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Left Pane: Description / Submissions / Editorial / Result Tabs */}
        <div
          style={{
            width: `${leftWidthPercent}%`,
            backgroundColor: "#09090b",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Left Tab Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              backgroundColor: "#121212",
              borderBottom: "1px solid #262626",
              flexShrink: 0,
              overflowX: "auto",
            }}
          >
            <button
              onClick={() => setActiveLeftTab("description")}
              style={activeLeftTab === "description" ? leftTabActiveStyle : leftTabInactiveStyle}
            >
              <FileText style={{ width: 14, height: 14, color: "#34d399" }} />
              <span>Description</span>
            </button>

            <button
              onClick={() => setActiveLeftTab("submissions")}
              style={activeLeftTab === "submissions" ? leftTabActiveStyle : leftTabInactiveStyle}
            >
              <Clock style={{ width: 14, height: 14, color: "#fbbf24" }} />
              <span>Submissions</span>
            </button>

            <button
              onClick={() => setActiveLeftTab("editorial")}
              style={activeLeftTab === "editorial" ? leftTabActiveStyle : leftTabInactiveStyle}
            >
              <BookOpen style={{ width: 14, height: 14, color: "#38bdf8" }} />
              <span>Editorial</span>
            </button>

            {/* Dynamic Submission Result Tab (Only Appears After Submit!) */}
            {latestVerdict && (
              <button
                onClick={() => setActiveLeftTab("result")}
                style={activeLeftTab === "result" ? leftTabActiveStyle : leftTabInactiveStyle}
              >
                {latestVerdict.status === "ACCEPTED" ? (
                  <CheckCircle2 style={{ width: 14, height: 14, color: "#34d399" }} />
                ) : (
                  <XCircle style={{ width: 14, height: 14, color: "#f87171" }} />
                )}
                <span>Result</span>

                {/* Close Result Tab Button */}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setLatestVerdict(null);
                    if (activeLeftTab === "result") {
                      setActiveLeftTab("description");
                    }
                  }}
                  title="Close evaluation result tab"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "4px",
                    padding: "2px",
                    borderRadius: "4px",
                    color: "#71717a",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
                >
                  <X style={{ width: 12, height: 12 }} />
                </span>
              </button>
            )}
          </div>

          {/* Left Tab Content Pane */}
          <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
            {activeLeftTab === "description" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                    {problem.title}
                  </h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {problem.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          padding: "2px 8px",
                          fontSize: "11px",
                          fontFamily: "monospace",
                          borderRadius: "4px",
                          backgroundColor: "#18181b",
                          border: "1px solid #27272a",
                          color: "#a1a1aa",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Formatted Problem Description Renderer */}
                <ProblemDescriptionFormatter description={problem.description} />

                {/* Constraints Card */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(24, 24, 27, 0.6)",
                    border: "1px solid #27272a",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <h4 style={{ fontSize: "11px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.05em", color: "#a1a1aa", fontWeight: 700, margin: 0 }}>
                    Problem Constraints:
                  </h4>
                  <ul style={{ fontSize: "12px", fontFamily: "monospace", color: "#d4d4d8", paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <li>Execution Time Limit: {problem.timeLimit} ms</li>
                    <li>Memory Allocation Limit: {problem.memoryLimit} MB</li>
                  </ul>
                </div>
              </div>
            )}

            {activeLeftTab === "submissions" && (
              <SubmissionHistoryViewer submissions={submissionsList} />
            )}

            {activeLeftTab === "editorial" && (
              <div style={{ padding: "32px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <Sparkles style={{ width: 32, height: 32, color: "#fbbf24" }} />
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Solution Editorial</h4>
                <p style={{ fontSize: "13px", color: "#a1a1aa", maxWidth: "360px", margin: 0 }}>
                  Algorithmic complexity writeup & optimal solution hints for this problem.
                </p>
              </div>
            )}

            {/* Submission Verdict Result Tab View */}
            {activeLeftTab === "result" && latestVerdict && (
              <SubmissionVerdictView verdict={latestVerdict} />
            )}
          </div>
        </div>

        {/* Vertical Resizable Drag Handle (Left vs Right) */}
        <div
          onMouseDown={handleHorizontalMouseDown}
          title="Drag to resize description / editor panes"
          style={{
            width: "6px",
            cursor: "col-resize",
            backgroundColor: "#18181b",
            borderLeft: "1px solid #262626",
            borderRight: "1px solid #262626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            transition: "background-color 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#10b981")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#18181b")}
        >
          <GripVertical style={{ width: 10, height: 10, color: "#a1a1aa", opacity: 0.6 }} />
        </div>

        {/* Right Pane: Monaco Editor + Collapsible Test Console Drawer */}
        <div style={{ flex: 1, backgroundColor: "#000000", display: "flex", flexDirection: "column", overflow: "hidden", padding: "6px", gap: "6px" }}>
          {/* Top: Monaco Code Editor (Scalable) */}
          <div style={{ flex: 1, minHeight: "150px", overflow: "hidden", display: "flex" }}>
            <MonacoCodeEditor
              problemSlug={problem.slug}
              language={language}
              onLanguageChange={setLanguage}
              code={code}
              onCodeChange={setCode}
              dbTemplates={problem.templates}
            />
          </div>

          {/* Drawer Toggle & Vertical Resizable Drag Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 12px",
              backgroundColor: "#121212",
              border: "1px solid #262626",
              borderRadius: "8px",
              flexShrink: 0,
              position: "relative",
            }}
          >
            {isDrawerOpen && (
              <div
                onMouseDown={handleVerticalMouseDown}
                title="Drag up/down to adjust console drawer height"
                style={{
                  position: "absolute",
                  top: "-4px",
                  left: 0,
                  right: 0,
                  height: "8px",
                  cursor: "row-resize",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 15,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.4)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <GripHorizontal style={{ width: 12, height: 12, color: "#34d399", opacity: 0.8 }} />
              </div>
            )}

            <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#a1a1aa", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              <span>Console & Sample Test Cases</span>
            </span>

            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              style={{
                background: "none",
                border: "none",
                color: "#a1a1aa",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {isDrawerOpen ? <ChevronDown style={{ width: 16, height: 16 }} /> : <ChevronUp style={{ width: 16, height: 16 }} />}
            </button>
          </div>

          {/* Bottom: Test Console Drawer (Scalable Height) */}
          {isDrawerOpen && (
            <div style={{ height: `${consoleHeightPx}px`, flexShrink: 0, overflow: "hidden" }}>
              <TestConsoleDrawer
                sampleTestCases={problem.testCases}
                testResults={testResults}
                isRunning={isRunningTests}
                onRunTestCases={handleRunCode}
                customInput={customInput}
                onCustomInputChange={setCustomInput}
                paramCount={problem.paramCount}
                paramNames={problem.paramNames}
                jsRunner={activeJsRunner}
                jsChecker={activeJsChecker}
                userCode={code}
                language={language}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
