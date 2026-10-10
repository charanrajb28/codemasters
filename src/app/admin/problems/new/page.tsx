"use client";

import React, { useState, useActionState } from "react";
import { createProblemAction } from "@/actions/problem-actions";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { TestCaseManager, TestCaseItem } from "@/components/admin/TestCaseManager";
import { TemplateManager, LanguageTemplates } from "@/components/admin/TemplateManager";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Code2, ArrowLeft, Save, Upload, FileJson, CheckCircle2, XCircle, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

// ─── Default field values ────────────────────────────────────────────────────

const DEFAULT_JS_RUNNER = `// JS Runner: reference solution only
// Receives inputs (string[]) and returns expected output.
const [nums, target] = inputs.map(x => { try { return JSON.parse(x); } catch { return x; } });
const seen = {};
for (let i = 0; i < nums.length; i++) {
  const complement = target - nums[i];
  if (seen[complement] !== undefined) return JSON.stringify([seen[complement], i]);
  seen[nums[i]] = i;
}
return JSON.stringify([]);`;

const DEFAULT_JS_CHECKER = `// JS Checker Code: Validates generated actual output against expected output
// Parameters: actualOutput (string), expectedOutput (string), inputs (array)
try {
  if (!expectedOutput || expectedOutput.trim() === "" || expectedOutput === "N/A") {
    return { passed: true, message: "Executed custom test case successfully." };
  }
  const cleanActual = String(actualOutput).trim();
  const cleanExpected = String(expectedOutput).trim();
  const passed = cleanActual === cleanExpected;
  return {
    passed,
    message: passed ? "Output matched expected result!" : \`Output mismatch. Expected: \${cleanExpected}, Got: \${cleanActual}\`
  };
} catch (err) {
  return { passed: false, message: "Checker error: " + err.message };
}`;

const DEFAULT_DESCRIPTION =
  "## Problem Description\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\n### Example 1:\n- **Input:** nums = [2,7,11,15], target = 9\n- **Output:** [0,1]\n- **Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].";

// ─── JSON Schema hint shown in the import modal ──────────────────────────────
const JSON_SCHEMA_EXAMPLE = `{
  "title": "Find Largest Element in Array",
  "difficulty": "Easy",
  "timeLimit": 2000,
  "memoryLimit": 256,
  "tags": "Array, Linear Scan, Basics",
  "description": "## Problem Description\\nGiven an array...",
  "paramCount": 1,
  "paramNames": "nums",
  "jsRunner": "const nums = JSON.parse(inputs[0]);\\nreturn JSON.stringify(Math.max(...nums));",
  "jsChecker": "// optional — defaults to strict equality check",
  "templates": {
    "python": {
      "starterCode": "def solve(nums):\\n    return max(nums)",
      "driverCode": "import json,sys\\n{{USER_CODE}}\\n..."
    },
    "javascript": { "starterCode": "...", "driverCode": "..." },
    "cpp": { "starterCode": "...", "driverCode": "..." },
    "java": { "starterCode": "...", "driverCode": "..." }
  },
  "testCases": [
    { "input": "[1,5,3,9,2]", "output": "9", "isHidden": false },
    { "input": "[10,20,4]",   "output": "20", "isHidden": true  }
  ]
}`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewProblemPage() {
  const [errorMessage, formAction, isPending] = useActionState(createProblemAction, undefined);

  // ── Form field state (all controlled so JSON import can update them) ──────
  const [formKey, setFormKey]           = useState(0); // increment to force TemplateManager / TestCaseManager re-mount
  const [title, setTitle]               = useState("");
  const [difficulty, setDifficulty]     = useState("Easy");
  const [timeLimit, setTimeLimit]       = useState(2000);
  const [memoryLimit, setMemoryLimit]   = useState(256);
  const [tags, setTags]                 = useState("");
  const [description, setDescription]   = useState(DEFAULT_DESCRIPTION);
  const [paramCount, setParamCount]     = useState(2);
  const [paramNames, setParamNames]     = useState("nums, target");
  const [jsRunner, setJsRunner]         = useState(DEFAULT_JS_RUNNER);
  const [jsChecker, setJsChecker]       = useState(DEFAULT_JS_CHECKER);
  const [templates, setTemplates]       = useState<LanguageTemplates | null>(null);
  const [testCases, setTestCases]       = useState<TestCaseItem[]>([]);

  // ── JSON Import modal state ───────────────────────────────────────────────
  const [showImportPanel, setShowImportPanel] = useState(true); // open by default on a new page
  const [jsonInput, setJsonInput]             = useState("");
  const [importError, setImportError]         = useState("");
  const [importSuccess, setImportSuccess]     = useState(false);
  const [schemaExpanded, setSchemaExpanded]   = useState(false);

  // ── JSON Import handler ───────────────────────────────────────────────────
  const handleJsonImport = () => {
    setImportError("");
    setImportSuccess(false);

    if (!jsonInput.trim()) {
      setImportError("Please paste a JSON object before importing.");
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      setImportError("Invalid JSON syntax — check for missing quotes, commas, or brackets.");
      return;
    }

    if (typeof parsed !== "object" || Array.isArray(parsed)) {
      setImportError("JSON must be a single object { ... }, not an array.");
      return;
    }

    // Populate each field if present in the JSON
    if (typeof parsed.title === "string")       setTitle(parsed.title);
    if (typeof parsed.difficulty === "string" && ["Easy","Medium","Hard"].includes(parsed.difficulty))
      setDifficulty(parsed.difficulty);
    if (typeof parsed.timeLimit === "number")   setTimeLimit(parsed.timeLimit);
    if (typeof parsed.memoryLimit === "number") setMemoryLimit(parsed.memoryLimit);
    if (typeof parsed.tags === "string")        setTags(parsed.tags);
    if (Array.isArray(parsed.tags))             setTags((parsed.tags as string[]).join(", "));
    if (typeof parsed.description === "string") setDescription(parsed.description);
    if (typeof parsed.paramCount === "number")  setParamCount(parsed.paramCount);
    if (typeof parsed.paramNames === "string")  setParamNames(parsed.paramNames);
    if (Array.isArray(parsed.paramNames))       setParamNames((parsed.paramNames as string[]).join(", "));
    if (typeof parsed.jsRunner === "string")    setJsRunner(parsed.jsRunner);
    if (typeof parsed.jsChecker === "string")   setJsChecker(parsed.jsChecker);

    if (parsed.templates && typeof parsed.templates === "object" && !Array.isArray(parsed.templates)) {
      setTemplates(parsed.templates as LanguageTemplates);
    }

    if (Array.isArray(parsed.testCases)) {
      const tcs = (parsed.testCases as any[]).map((tc) => ({
        input: String(tc.input ?? ""),
        output: String(tc.output ?? ""),
        isHidden: Boolean(tc.isHidden),
      }));
      setTestCases(tcs);
    }

    // Bump formKey to force TemplateManager & TestCaseManager to re-mount
    setFormKey((k) => k + 1);
    setImportSuccess(true);
    setShowImportPanel(false);
    setJsonInput("");
  };

  const handleClearImport = () => {
    setJsonInput("");
    setImportError("");
    setImportSuccess(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/admin/problems">
            <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />}>Back</Button>
          </Link>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            Create Coding Problem
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowImportPanel((v) => !v)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700,
            fontFamily: "var(--font-sans), sans-serif",
            background: showImportPanel
              ? "linear-gradient(135deg, #059669, #047857)"
              : "linear-gradient(135deg, #1d4ed8, #1e40af)",
            color: "#fff", border: "none", cursor: "pointer",
            boxShadow: showImportPanel
              ? "0 4px 14px rgba(5,150,105,0.4)"
              : "0 4px 14px rgba(29,78,216,0.4)",
            transition: "all 0.2s ease",
          }}
        >
          <FileJson size={16} />
          {showImportPanel ? "Hide JSON Import" : "Import from JSON"}
        </button>
      </div>

      {/* ── JSON Import Panel ── */}
      {showImportPanel && (
        <div
          style={{
            padding: "0",
            borderRadius: "14px",
            border: "1px solid rgba(99,102,241,0.4)",
            background: "linear-gradient(135deg, rgba(15,15,30,0.98), rgba(20,20,40,0.98))",
            boxShadow: "0 8px 32px rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Panel Header */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "18px 24px",
              borderBottom: "1px solid rgba(99,102,241,0.2)",
              background: "linear-gradient(90deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
            }}
          >
            <div
              style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
              }}
            >
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", margin: 0 }}>
                JSON Problem Import
              </h3>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                Paste a problem JSON object — all fields below will be auto-filled instantly
              </p>
            </div>
          </div>

          {/* Panel Body */}
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Success banner */}
            {importSuccess && (
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "12px 16px", borderRadius: "8px",
                  backgroundColor: "rgba(5,150,105,0.15)", border: "1px solid rgba(5,150,105,0.4)",
                }}
              >
                <CheckCircle2 size={18} color="#34d399" />
                <span style={{ fontSize: "13px", color: "#34d399", fontWeight: 600 }}>
                  Problem data imported successfully! All fields have been populated below.
                </span>
              </div>
            )}

            {/* Error banner */}
            {importError && (
              <div
                style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  padding: "12px 16px", borderRadius: "8px",
                  backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <XCircle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: "13px", color: "#f87171" }}>{importError}</span>
              </div>
            )}

            {/* Textarea */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>
                Paste Problem JSON Here
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => { setJsonInput(e.target.value); setImportError(""); setImportSuccess(false); }}
                placeholder={`{\n  "title": "Two Sum",\n  "difficulty": "Easy",\n  "testCases": [...]\n  ...\n}`}
                rows={12}
                style={{
                  width: "100%",
                  backgroundColor: "#060610",
                  color: "#c7d2fe",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: "12px",
                  border: importError ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(99,102,241,0.3)",
                  borderRadius: "10px",
                  padding: "14px",
                  outline: "none",
                  resize: "vertical",
                  lineHeight: 1.6,
                  boxSizing: "border-box",
                  transition: "border-color 0.2s ease",
                }}
              />
            </div>

            {/* Schema Reference (collapsible) */}
            <div
              style={{
                borderRadius: "8px",
                border: "1px solid rgba(99,102,241,0.15)",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => setSchemaExpanded((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  width: "100%", padding: "10px 14px",
                  background: "rgba(99,102,241,0.06)", border: "none",
                  cursor: "pointer", textAlign: "left",
                  color: "rgba(165,180,252,0.9)", fontSize: "12px", fontFamily: "monospace",
                }}
              >
                {schemaExpanded
                  ? <ChevronDown size={14} />
                  : <ChevronRight size={14} />
                }
                <FileJson size={13} />
                <span style={{ fontWeight: 600 }}>View supported JSON schema / example</span>
              </button>
              {schemaExpanded && (
                <pre
                  style={{
                    margin: 0, padding: "14px",
                    backgroundColor: "#040408",
                    color: "#818cf8",
                    fontSize: "11px",
                    fontFamily: "'JetBrains Mono', monospace",
                    lineHeight: 1.7,
                    overflowX: "auto",
                    borderTop: "1px solid rgba(99,102,241,0.1)",
                  }}
                >
                  {JSON_SCHEMA_EXAMPLE}
                </pre>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleClearImport}
                style={{
                  padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                  background: "transparent", border: "1px solid rgba(99,102,241,0.3)",
                  color: "rgba(165,180,252,0.7)", cursor: "pointer",
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleJsonImport}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "9px 22px", borderRadius: "8px", fontSize: "13px", fontWeight: 700,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff", border: "none", cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.45)",
                  transition: "all 0.15s ease",
                }}
              >
                <Upload size={15} />
                Import & Fill Fields
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Form Card ── */}
      <Card glass style={{ border: "1px solid var(--border-bright)" }}>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Problem Metadata & Rules</CardTitle>
            <CardDescription>Configure problem title, difficulty rating, execution bounds, and tags</CardDescription>
          </CardHeader>
          <CardContent style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {errorMessage && (
              <div style={{ padding: "10px 14px", borderRadius: "6px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", fontSize: "13px" }}>
                {errorMessage}
              </div>
            )}

            {/* Title + Difficulty */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
              <Input
                label="Problem Title"
                name="title"
                placeholder="e.g. Two Sum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{
                    width: "100%", backgroundColor: "var(--bg-card)", color: "#ffffff",
                    border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)",
                    padding: "10px 14px", fontSize: "14px", outline: "none",
                  }}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Time + Memory + Tags */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "16px" }}>
              <Input
                label="Time Limit (ms)"
                name="timeLimit"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                required
              />
              <Input
                label="Memory Limit (MB)"
                name="memoryLimit"
                type="number"
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(Number(e.target.value))}
                required
              />
              <Input
                label="Tags (Comma-Separated)"
                name="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Array, Hash Table, Two Pointers"
              />
            </div>

            {/* Description Editor */}
            <MarkdownEditor value={description} onChange={setDescription} />

            {/* JS Runner & Checker */}
            <div
              style={{
                padding: "16px", backgroundColor: "#0e0e0e",
                border: "1px solid var(--border-bright)", borderRadius: "var(--radius-md)",
                display: "flex", flexDirection: "column", gap: "16px",
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                <Code2 size={18} color="#34d399" /> Custom Test Case Runner &amp; Validator Configuration
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                Define input parameter count for custom testcase input boxes and custom JavaScript runner &amp; checker logic.
              </p>

              {/* Param Count + Names */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
                <Input
                  label="Number of Parameters (Input Boxes)"
                  name="paramCount"
                  type="number"
                  min={1}
                  max={10}
                  value={paramCount}
                  onChange={(e) => setParamCount(Number(e.target.value))}
                  required
                />
                <Input
                  label="Parameter Names (Comma-Separated)"
                  name="paramNames"
                  value={paramNames}
                  onChange={(e) => setParamNames(e.target.value)}
                  placeholder="e.g. nums, target"
                />
              </div>

              {/* JS Runner */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                  JavaScript Driver / Code Runner (jsRunner)
                </label>
                <textarea
                  name="jsRunner"
                  rows={6}
                  value={jsRunner}
                  onChange={(e) => setJsRunner(e.target.value)}
                  style={{
                    width: "100%", backgroundColor: "#050505", color: "#34d399",
                    fontFamily: "var(--font-mono, monospace)", fontSize: "12px",
                    border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)",
                    padding: "12px", outline: "none", resize: "vertical", boxSizing: "border-box",
                  }}
                />
              </div>

              {/* JS Checker */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                  JavaScript Output Checker / Evaluator (jsChecker)
                </label>
                <textarea
                  name="jsChecker"
                  rows={6}
                  value={jsChecker}
                  onChange={(e) => setJsChecker(e.target.value)}
                  style={{
                    width: "100%", backgroundColor: "#050505", color: "#fbbf24",
                    fontFamily: "var(--font-mono, monospace)", fontSize: "12px",
                    border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)",
                    padding: "12px", outline: "none", resize: "vertical", boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Language Templates (re-mounts on import via key) */}
            <TemplateManager key={`templates-${formKey}`} initialTemplates={templates ?? undefined} />

            {/* Test Cases (re-mounts on import via key) */}
            <TestCaseManager key={`testcases-${formKey}`} initialTestCases={testCases} />
          </CardContent>

          <CardFooter style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Link href="/admin/problems">
              <Button type="button" variant="outline" size="md">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" size="md" disabled={isPending} icon={<Save size={16} />}>
              {isPending ? "Creating Problem..." : "Save Problem"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
