"use client";

import React, { useState, useActionState } from "react";
import { createProblemAction } from "@/actions/problem-actions";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { TestCaseManager, TestCaseItem } from "@/components/admin/TestCaseManager";
import { TemplateManager } from "@/components/admin/TemplateManager";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Code2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewProblemPage() {
  const [errorMessage, formAction, isPending] = useActionState(createProblemAction, undefined);
  const [description, setDescription] = useState(
    "## Problem Description\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\n### Example 1:\n- **Input:** nums = [2,7,11,15], target = 9\n- **Output:** [0,1]\n- **Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1]."
  );

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/admin/problems">
            <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />}>
              Back
            </Button>
          </Link>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            Create Coding Problem
          </h1>
        </div>
      </div>

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

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
              <Input
                label="Problem Title"
                name="title"
                placeholder="e.g. Two Sum"
                required
              />

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  defaultValue="Easy"
                  style={{
                    width: "100%",
                    backgroundColor: "var(--bg-card)",
                    color: "#ffffff",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 14px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "16px" }}>
              <Input
                label="Time Limit (ms)"
                name="timeLimit"
                type="number"
                defaultValue={2000}
                required
              />

              <Input
                label="Memory Limit (MB)"
                name="memoryLimit"
                type="number"
                defaultValue={256}
                required
              />

              <Input
                label="Tags (Comma-Separated)"
                name="tags"
                placeholder="Arrays, Hash Table, Two Pointers"
              />
            </div>

            {/* Split-pane Markdown Editor */}
            <MarkdownEditor value={description} onChange={setDescription} />

            {/* Custom Test Case JS Runner & Checker Configuration */}
            <div style={{ padding: "16px", backgroundColor: "#0e0e0e", border: "1px solid var(--border-bright)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                <Code2 size={18} color="#34d399" /> Custom Test Case Runner &amp; Validator Configuration
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                Define input parameter count for custom testcase input boxes and custom JavaScript runner &amp; checker logic.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
                <Input
                  label="Number of Parameters (Input Boxes)"
                  name="paramCount"
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={2}
                  required
                />
                <Input
                  label="Parameter Names (Comma-Separated)"
                  name="paramNames"
                  defaultValue="nums, target"
                  placeholder="e.g. nums, target"
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                  JavaScript Driver / Code Runner (jsRunner)
                </label>
                <textarea
                  name="jsRunner"
                  rows={6}
                  defaultValue={`// JS Runner: reference solution only
// Receives inputs (string[]) and returns expected output.
const [nums, target] = inputs.map(x => { try { return JSON.parse(x); } catch { return x; } });
const seen = {};
for (let i = 0; i < nums.length; i++) {
  const complement = target - nums[i];
  if (seen[complement] !== undefined) return JSON.stringify([seen[complement], i]);
  seen[nums[i]] = i;
}
return JSON.stringify([]);`}
                  style={{
                    width: "100%",
                    backgroundColor: "#050505",
                    color: "#34d399",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "12px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                  JavaScript Output Checker / Evaluator (jsChecker)
                </label>
                <textarea
                  name="jsChecker"
                  rows={6}
                  defaultValue={`// JS Checker Code: Validates generated actual output against expected output
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
}`}
                  style={{
                    width: "100%",
                    backgroundColor: "#050505",
                    color: "#fbbf24",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "12px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* DB Language Templates Manager */}
            <TemplateManager />

            {/* Test Case Manager */}
            <TestCaseManager />
          </CardContent>

          <CardFooter style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Link href="/admin/problems">
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
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
