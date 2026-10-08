"use client";

import React, { useState, useActionState } from "react";
import { updateProblemAction } from "@/actions/problem-actions";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { TestCaseManager } from "@/components/admin/TestCaseManager";
import { TemplateManager } from "@/components/admin/TemplateManager";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface EditProblemFormProps {
  problem: {
    id: string;
    title: string;
    difficulty: string;
    description: string;
    timeLimit: number;
    memoryLimit: number;
    tags: string[];
    paramCount?: number;
    paramNames?: string[];
    jsRunner?: string;
    jsChecker?: string;
    templates?: any;
    testCases: {
      id: string;
      input: string;
      output: string;
      isHidden: boolean;
    }[];
  };
}

export const EditProblemForm: React.FC<EditProblemFormProps> = ({ problem }) => {
  const updateProblemWithId = updateProblemAction.bind(null, problem.id);
  const [errorMessage, formAction, isPending] = useActionState(updateProblemWithId, undefined);
  const [description, setDescription] = useState(problem.description);

  const defaultRunner = problem.jsRunner || `// JS Runner: reference solution only
// Receives inputs (string[]) and returns expected output.
const [nums, target] = inputs.map(x => { try { return JSON.parse(x); } catch { return x; } });
const seen = {};
for (let i = 0; i < nums.length; i++) {
  const complement = target - nums[i];
  if (seen[complement] !== undefined) return JSON.stringify([seen[complement], i]);
  seen[nums[i]] = i;
}
return JSON.stringify([]);`;

  const defaultChecker = problem.jsChecker || `// JS Checker Code: Validates generated actual output against expected output
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

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/admin/problems">
            <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />}>
              Back
            </Button>
          </Link>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            Edit Problem: {problem.title}
          </h1>
        </div>
      </div>

      <Card glass style={{ border: "1px solid var(--border-bright)" }}>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Problem Metadata & Rules</CardTitle>
            <CardDescription>Update problem parameters, description, custom JS runner/checker, and test cases</CardDescription>
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
                defaultValue={problem.title}
                required
              />

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  defaultValue={problem.difficulty}
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
                defaultValue={problem.timeLimit}
                required
              />

              <Input
                label="Memory Limit (MB)"
                name="memoryLimit"
                type="number"
                defaultValue={problem.memoryLimit}
                required
              />

              <Input
                label="Tags (Comma-Separated)"
                name="tags"
                defaultValue={problem.tags.join(", ")}
              />
            </div>

            <MarkdownEditor value={description} onChange={setDescription} />

            {/* Custom Test Case JS Runner & Checker Configuration */}
            <div style={{ padding: "16px", backgroundColor: "#0e0e0e", border: "1px solid var(--border-bright)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                Custom Test Case Runner &amp; Validator Configuration
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
                  defaultValue={problem.paramCount ?? 2}
                  required
                />
                <Input
                  label="Parameter Names (Comma-Separated)"
                  name="paramNames"
                  defaultValue={problem.paramNames?.join(", ") ?? "nums, target"}
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
                  defaultValue={defaultRunner}
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
                  defaultValue={defaultChecker}
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

            <TemplateManager initialTemplates={problem.templates} />

            <TestCaseManager
              initialTestCases={problem.testCases}
              jsRunner={defaultRunner}
              jsChecker={defaultChecker}
            />
          </CardContent>

          <CardFooter style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Link href="/admin/problems">
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="md" disabled={isPending} icon={<Save size={16} />}>
              {isPending ? "Saving Changes..." : "Update Problem"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
