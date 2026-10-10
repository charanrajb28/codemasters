"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Terminal, Play, Plus, Clock, Code2, X, Zap } from "lucide-react";

export interface SampleTestResult {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  execTimeMs: number;
  stdout: string;
  stderr?: string;
}

export interface TestCaseItem {
  id: string;
  label: string;
  params: string[];
  expectedOutput: string;
  isCustom: boolean;
}

interface TestConsoleDrawerProps {
  sampleTestCases: { id: string; input: string; output: string }[];
  testResults: SampleTestResult[] | null;
  isRunning: boolean;
  onRunTestCases: (customInput?: string | string[]) => void;
  customInputs: string[];
  onCustomInputsChange: (val: string[]) => void;
  paramCount?: number;
  paramNames?: string[];
  jsRunner?: string;
  jsChecker?: string;
  userCode?: string;
  language?: string;
}

export function TestConsoleDrawer({
  sampleTestCases,
  testResults,
  isRunning,
  onRunTestCases,
  customInputs,
  onCustomInputsChange,
  paramCount = 2,
  paramNames = ["nums", "target"],
  jsRunner,
  jsChecker,
  userCode = "",
  language = "python",
}: TestConsoleDrawerProps) {
  const effectiveParamCount = Math.max(1, paramCount);

  /**
   * JS Runner: runs the problem-level reference solution in the browser.
   * Input:  params (string[]) — raw values the student sees in the UI
   * Output: string            — the EXPECTED OUTPUT for that input
   *
   * The jsRunner code stored in Firestore receives `inputs` (string[]).
   * Example jsRunner body:
   *   const [nums, target] = inputs.map(x => JSON.parse(x));
   *   // ... reference solution ...
   *   return JSON.stringify(result);
   */
  const computeExpectedOutput = useCallback(
    (params: string[]): string => {
      if (!jsRunner || !jsRunner.trim()) return "";
      try {
        const fn = new Function("inputs", jsRunner);
        const result = fn(params);
        if (result === undefined || result === null) return "";
        return typeof result === "object" ? JSON.stringify(result) : String(result);
      } catch {
        return "";
      }
    },
    [jsRunner]
  );

  const buildInitialTestCases = useCallback((): TestCaseItem[] => {
    if (sampleTestCases && sampleTestCases.length > 0) {
      return sampleTestCases.map((tc, idx) => {
        const paramLines = tc.input.split("\n");
        const params = Array.from({ length: effectiveParamCount }, (_, i) =>
          paramLines[i] !== undefined ? paramLines[i] : i === 0 ? tc.input : ""
        );
        // Use stored Firestore output first; if missing, derive live from jsRunner
        const storedOutput = tc.output && tc.output.trim() ? tc.output : "";
        const expectedOutput = storedOutput || computeExpectedOutput(params);
        return {
          id: tc.id || `tc_${idx + 1}`,
          label: `Case ${idx + 1}`,
          params,
          expectedOutput,
          isCustom: false,
        };
      });
    }
    const defaultParams = Array.from({ length: effectiveParamCount }, (_, i) =>
      i === 0 ? "[2,7,11,15]" : i === 1 ? "9" : ""
    );
    return [{
      id: "tc_1",
      label: "Case 1",
      params: defaultParams,
      expectedOutput: computeExpectedOutput(defaultParams) || "[0,1]",
      isCustom: false,
    }];
  }, [sampleTestCases, effectiveParamCount, computeExpectedOutput]);

  const [testCases, setTestCases] = useState<TestCaseItem[]>(buildInitialTestCases);
  const [activeTab, setActiveTab] = useState<number>(0);

  /**
   * localResultsMap — keyed by testCase id.
   * Populated after server (Kubernetes) run completes and jsChecker runs.
   */
  const [localResultsMap, setLocalResultsMap] = useState<Record<string, SampleTestResult>>({});

  // Sync parent customInput when active tab / params change
  useEffect(() => {
    const cur = testCases[activeTab] || testCases[0];
    onCustomInputsChange(testCases.map((tc) => tc.params.join("\n")));
  }, [activeTab, testCases]);

  /**
   * When the server (Kubernetes) returns actual outputs:
   * 1. Attach the jsRunner-computed expectedOutput to each result.
   * 2. Run jsChecker to determine pass/fail.
   * 3. Store merged result in localResultsMap.
   */
  useEffect(() => {
    if (!testResults || testResults.length === 0) return;

    setLocalResultsMap((prev) => {
      const next = { ...prev };

      testResults.forEach((serverResult, idx) => {
        const tc = testCases[idx];
        if (!tc) return;

        const expectedOutput = tc.expectedOutput || serverResult.expectedOutput || "";
        const actualOutput = serverResult.actualOutput || "";
        const hasRuntimeError =
          actualOutput.startsWith("Runtime Error") ||
          actualOutput.startsWith("Compilation Error") ||
          (!!serverResult.stderr && serverResult.stderr.trim().length > 0);

        let passed = false;
        let stderr = serverResult.stderr;

        if (hasRuntimeError) {
          passed = false;
          stderr = serverResult.stderr || actualOutput;
        } else if (jsChecker && jsChecker.trim() && expectedOutput) {
          // Run jsChecker to compare actual vs expected
          try {
            const checkerFn = new Function("actualOutput", "expectedOutput", "inputs", jsChecker);
            const checkRes = checkerFn(actualOutput, expectedOutput, tc.params);
            if (typeof checkRes === "object" && checkRes !== null) {
              passed = !!checkRes.passed;
              stderr = passed
                ? undefined
                : checkRes.message || `Expected: ${expectedOutput}, Got: ${actualOutput}`;
            } else {
              passed = !!checkRes;
              if (!passed) stderr = `Expected: ${expectedOutput}, Got: ${actualOutput}`;
              else stderr = undefined;
            }
          } catch (err: any) {
            passed = false;
            stderr = `Checker error: ${err.message}`;
          }
        } else if (expectedOutput) {
          // Fallback: normalize and compare
          const norm = (s: string) => {
            try { return JSON.stringify(JSON.parse(s.trim())); } catch { return s.trim(); }
          };
          passed = norm(actualOutput) === norm(expectedOutput);
          if (!passed) stderr = `Expected: ${expectedOutput}, Got: ${actualOutput}`;
          else stderr = undefined;
        } else {
          // No expected output — just show output, no verdict
          passed = !hasRuntimeError;
          stderr = undefined;
        }

        next[tc.id] = { ...serverResult, id: tc.id, expectedOutput, passed, stderr };
      });

      return next;
    });
  }, [testResults]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Add a custom test case tab; jsRunner computes initial expected output */
  const handleAddTestCase = () => {
    const nextIndex = testCases.length + 1;
    const defaultParams = Array.from({ length: effectiveParamCount }, (_, i) =>
      i === 0 ? "[3,2,4]" : i === 1 ? "6" : ""
    );
    const newCase: TestCaseItem = {
      id: `custom_${Date.now()}`,
      label: `Case ${nextIndex}`,
      params: defaultParams,
      expectedOutput: computeExpectedOutput(defaultParams),
      isCustom: true,
    };
    const updated = [...testCases, newCase];
    setTestCases(updated);
    setActiveTab(updated.length - 1);
  };

  const handleRemoveTestCase = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    if (testCases.length <= 1) return;
    const updated = testCases.filter((_, idx) => idx !== indexToRemove);
    setTestCases(updated);
    if (activeTab === indexToRemove) setActiveTab(Math.max(0, indexToRemove - 1));
    else if (activeTab > indexToRemove) setActiveTab(activeTab - 1);
  };

  /**
   * Param change: update value AND recompute expectedOutput via jsRunner live.
   * This means as the student types new inputs, the expected output badge updates instantly.
   */
  const handleParamChange = (paramIndex: number, val: string) => {
    setTestCases((prev) => {
      const updated = [...prev];
      if (!updated[activeTab]) return prev;
      const tc = { ...updated[activeTab] };
      const newParams = [...tc.params];
      newParams[paramIndex] = val;
      tc.params = newParams;
      const newExpected = computeExpectedOutput(newParams);
      if (newExpected) tc.expectedOutput = newExpected;
      updated[activeTab] = tc;
      return updated;
    });
  };

  const activeCase = testCases[activeTab] || testCases[0];
  const activeResult = localResultsMap[activeCase?.id] ?? null;

  /**
   * Run Code:
   * 1. Refresh expectedOutput via jsRunner (in browser, instant).
   * 2. Send student code to Kubernetes via server action (onRunTestCases).
   * 3. When server responds, useEffect above runs jsChecker and stores result.
   */
  const handleRunTest = () => {
    if (!activeCase) return;
    // 1. Recompute expected output immediately
    const freshExpected = computeExpectedOutput(activeCase.params);
    if (freshExpected) {
      setTestCases((prev) => {
        const updated = [...prev];
        if (updated[activeTab]) {
          updated[activeTab] = { ...updated[activeTab], expectedOutput: freshExpected };
        }
        return updated;
      });
    }
    // 2. Dispatch every visible/custom tab to Kubernetes in parallel.
    onRunTestCases(testCases.map((testCase) => testCase.params.join("\n")));
  };

  // ── Styles ────────────────────────────────────────────────────────────────

  const tabActiveStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
    fontFamily: "monospace", backgroundColor: "#262626", color: "#ffffff",
    border: "1px solid #404040", cursor: "pointer", userSelect: "none",
  };
  const tabInactiveStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
    fontFamily: "monospace", backgroundColor: "#0a0a0a", color: "#a3a3a3",
    border: "1px solid #18181b", cursor: "pointer", userSelect: "none",
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0a0a0a", border: "1px solid #262626", borderRadius: "12px", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>

      {/* ── Header: Test Case Tabs + Run Button ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#121212", borderBottom: "1px solid #262626", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", overflowX: "auto" }}>
          <Terminal style={{ width: 15, height: 15, color: "#34d399", flexShrink: 0, marginRight: "4px" }} />

          {testCases.map((tc, idx) => {
            const res = localResultsMap[tc.id];
            const isActive = activeTab === idx;
            return (
              <button key={tc.id} onClick={() => setActiveTab(idx)} style={isActive ? tabActiveStyle : tabInactiveStyle}>
                <span>{tc.label}</span>
                {res && (res.passed
                  ? <CheckCircle2 style={{ width: 13, height: 13, color: "#34d399", flexShrink: 0 }} />
                  : <XCircle style={{ width: 13, height: 13, color: "#f87171", flexShrink: 0 }} />
                )}
                {testCases.length > 1 && (
                  <span
                    onClick={(e) => handleRemoveTestCase(e, idx)}
                    style={{ display: "inline-flex", alignItems: "center", marginLeft: "4px", padding: "2px", borderRadius: "4px", color: "#71717a", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
                  >
                    <X style={{ width: 12, height: 12 }} />
                  </span>
                )}
              </button>
            );
          })}

          {/* Add Custom Test Case (jsRunner auto-populates expected output) */}
          <button
            onClick={handleAddTestCase}
            style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace", backgroundColor: "#18181b", color: "#a1a1aa", border: "1px dashed #3f3f46", cursor: "pointer", transition: "all 0.15s ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#10b981"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#a1a1aa"; e.currentTarget.style.borderColor = "#3f3f46"; }}
          >
            <Plus style={{ width: 13, height: 13, color: "#fbbf24", flexShrink: 0 }} />
            <span>Add Case</span>
          </button>
        </div>

        {/* Run Code → Kubernetes */}
        <button
          onClick={handleRunTest}
          disabled={isRunning}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-sans), sans-serif", backgroundColor: "#10b981", color: "#000", border: "none", cursor: isRunning ? "not-allowed" : "pointer", opacity: isRunning ? 0.6 : 1, boxShadow: "0 2px 10px rgba(16,185,129,0.3)" }}
        >
          <Play style={{ width: 13, height: 13, fill: "currentColor" }} />
          <span>{isRunning ? "Running..." : "Run Code"}</span>
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, padding: "12px", overflowY: "auto", fontFamily: "monospace", fontSize: "12px", color: "#e4e4e7" }}>

        {/* Input Parameters */}
        {activeCase && (
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#a1a1aa", fontWeight: 600, marginBottom: "8px" }}>
              <Code2 style={{ width: 14, height: 14, color: "#fbbf24" }} />
              <span>Input Parameters ({activeCase.label}):</span>
            </label>

            <div style={{ padding: "12px", backgroundColor: "#121212", border: "1px solid #27272a", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: effectiveParamCount > 1 ? "1fr 1fr" : "1fr", gap: "8px" }}>
                {Array.from({ length: effectiveParamCount }).map((_, idx) => {
                  const paramLabel = paramNames[idx] || `param${idx + 1}`;
                  return (
                    <div key={idx}>
                      <label style={{ display: "block", fontSize: "10px", color: "#a1a1aa", marginBottom: "4px" }}>{paramLabel}:</label>
                      <input
                        type="text"
                        value={activeCase.params[idx] ?? ""}
                        onChange={(e) => handleParamChange(idx, e.target.value)}
                        placeholder={`Value for ${paramLabel}`}
                        style={{ width: "100%", padding: "6px 10px", backgroundColor: "#000", border: "1px solid #27272a", borderRadius: "6px", color: "#fff", fontFamily: "monospace", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Live Expected Output — computed by jsRunner in browser */}
              {activeCase.expectedOutput && (
                <div style={{ paddingTop: "8px", borderTop: "1px solid #27272a" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "#71717a", marginBottom: "4px" }}>
                    <Zap style={{ width: 11, height: 11, color: "#fbbf24" }} />
                    <span>Expected Output <em style={{ color: "#3f3f46" }}>(generated by JS Runner)</em>:</span>
                  </label>
                  <div style={{ padding: "5px 10px", backgroundColor: "#0a0a0a", border: "1px solid #27272a", borderRadius: "6px", color: "#34d399", fontSize: "12px" }}>
                    {activeCase.expectedOutput}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Execution Results (after Kubernetes run) ── */}
        {activeResult && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "8px", borderTop: "1px solid #27272a" }}>

            {/* Verdict Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: activeResult.passed ? "rgba(6,78,59,0.4)" : "rgba(136,19,55,0.4)", border: activeResult.passed ? "1px solid #065f46" : "1px solid #9f1239" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {activeResult.passed ? (
                  <><CheckCircle2 style={{ width: 16, height: 16, color: "#34d399" }} /><span style={{ fontWeight: 700, color: "#34d399", fontSize: "13px" }}>Passed</span></>
                ) : (
                  <><XCircle style={{ width: 16, height: 16, color: "#f87171" }} /><span style={{ fontWeight: 700, color: "#f87171", fontSize: "13px" }}>Output Mismatch / Error</span></>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#a1a1aa", fontSize: "11px" }}>
                <Clock style={{ width: 13, height: 13 }} />
                <span>Runtime: {activeResult.execTimeMs}ms</span>
              </div>
            </div>

            {/* Expected vs Actual Diff */}
            <div style={{ display: "grid", gridTemplateColumns: (activeResult.expectedOutput && activeResult.expectedOutput !== "N/A") ? "1fr 1fr" : "1fr", gap: "8px" }}>
              {activeResult.expectedOutput && activeResult.expectedOutput !== "N/A" && (
                <div>
                  <label style={{ display: "block", fontSize: "10px", textTransform: "uppercase", color: "#a1a1aa", fontWeight: 600, marginBottom: "4px" }}>Expected Output:</label>
                  <div style={{ padding: "8px 10px", backgroundColor: "#121212", border: "1px solid #27272a", borderRadius: "8px", color: "#34d399", minHeight: "40px", whiteSpace: "pre-wrap" }}>{activeResult.expectedOutput}</div>
                </div>
              )}
              <div>
                <label style={{ display: "block", fontSize: "10px", textTransform: "uppercase", color: "#a1a1aa", fontWeight: 600, marginBottom: "4px" }}>Actual Output:</label>
                <div style={{ padding: "8px 10px", backgroundColor: activeResult.passed ? "#121212" : "rgba(136,19,55,0.2)", border: activeResult.passed ? "1px solid #065f46" : "1px solid #9f1239", borderRadius: "8px", color: activeResult.passed ? "#34d399" : "#fca5a5", minHeight: "40px", whiteSpace: "pre-wrap" }}>{activeResult.actualOutput}</div>
              </div>
            </div>

            {/* Stdout */}
            {activeResult.stdout && (
              <div>
                <label style={{ display: "block", fontSize: "10px", textTransform: "uppercase", color: "#a1a1aa", fontWeight: 600, marginBottom: "4px" }}>Stdout Console Log:</label>
                <pre style={{ padding: "8px 10px", backgroundColor: "#000", border: "1px solid #27272a", borderRadius: "8px", color: "#d4d4d8", fontSize: "11px", overflowX: "auto", margin: 0 }}>{activeResult.stdout}</pre>
              </div>
            )}

            {/* Stderr */}
            {activeResult.stderr && (
              <div>
                <label style={{ display: "block", fontSize: "10px", textTransform: "uppercase", color: "#f87171", fontWeight: 600, marginBottom: "4px" }}>Stderr Error Log:</label>
                <pre style={{ padding: "8px 10px", backgroundColor: "rgba(136,19,55,0.3)", border: "1px solid #9f1239", borderRadius: "8px", color: "#fca5a5", fontSize: "11px", overflowX: "auto", margin: 0 }}>{activeResult.stderr}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
