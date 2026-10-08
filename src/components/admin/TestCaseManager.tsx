"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Trash2, Upload, Eye, EyeOff, FileText, Check } from "lucide-react";

export interface TestCaseItem {
  id?: string;
  input: string;
  output: string;
  isHidden: boolean;
}

interface TestCaseManagerProps {
  initialTestCases?: TestCaseItem[];
  onChange?: (testCases: TestCaseItem[]) => void;
  jsRunner?: string;
  jsChecker?: string;
}

export const TestCaseManager: React.FC<TestCaseManagerProps> = ({
  initialTestCases = [],
  onChange,
  jsRunner,
  jsChecker,
}) => {
  const [testCases, setTestCases] = useState<TestCaseItem[]>(
    initialTestCases.length > 0
      ? initialTestCases
      : [
          { input: "[3,2,4]\n6", output: "[1,2]", isHidden: false },
          { input: "[2,7,11,15]\n9", output: "[0,1]", isHidden: false },
          { input: "[3,3]\n6", output: "[0,1]", isHidden: true },
        ]
  );
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");

  const updateTestCases = (newCases: TestCaseItem[]) => {
    setTestCases(newCases);
    if (onChange) onChange(newCases);
  };

  const handleAddRow = () => {
    updateTestCases([...testCases, { input: "", output: "", isHidden: false }]);
  };

  const handleRemoveRow = (index: number) => {
    updateTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleChangeRow = (index: number, field: keyof TestCaseItem, value: any) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    updateTestCases(updated);
  };

  const handleAutoGenerateOutput = (index: number) => {
    const tc = testCases[index];
    if (!tc || !tc.input.trim()) return;

    try {
      const lines = tc.input.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      let valStr = lines.join("\n");
      
      const parsedInputs: any[] = [];
      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        let val = line;
        if (line.endsWith(":") && !line.startsWith("[") && !line.startsWith("{")) {
          if (i + 1 < lines.length) {
            val = lines[i + 1];
            i += 2;
          } else {
            i += 1;
            continue;
          }
        } else {
          i += 1;
        }

        try {
          parsedInputs.push(JSON.parse(val));
        } catch {
          parsedInputs.push(val);
        }
      }

      if (jsRunner && jsRunner.trim()) {
        const runnerFn = new Function("code", "inputs", jsRunner);
        const res = runnerFn("", lines);
        handleChangeRow(index, "output", typeof res === "object" ? JSON.stringify(res) : String(res));
      } else {
        // Simple default fallback auto-generator
        handleChangeRow(index, "output", parsedInputs.length > 0 ? JSON.stringify(parsedInputs[0]) : "N/A");
      }
    } catch (err: any) {
      handleChangeRow(index, "output", `[Auto-Gen Error: ${err.message || String(err)}]`);
    }
  };

  const handleImportJson = () => {
    try {
      setJsonError("");
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setJsonError("JSON must be an array of objects: [{ input, output, isHidden }]");
        return;
      }
      const formatted = parsed.map((item: any) => ({
        input: String(item.input || ""),
        output: String(item.output || ""),
        isHidden: Boolean(item.isHidden),
      }));

      updateTestCases([...testCases, ...formatted]);
      setShowJsonModal(false);
      setJsonText("");
    } catch (e) {
      setJsonError("Invalid JSON syntax. Please format correctly.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}>
      {/* Hidden input field carrying JSON for Server Action submission */}
      <input type="hidden" name="testCasesJson" value={JSON.stringify(testCases)} />

      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Test Cases ({testCases.length})
          </label>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Public sample cases vs Hidden evaluation test cases (Expected Output is optional)
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowJsonModal(true)} icon={<Upload size={14} />}>
            JSON / Batch Import
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={handleAddRow} icon={<Plus size={14} />}>
            Add Test Case
          </Button>
        </div>
      </div>

      {/* Test cases row editor */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {testCases.map((tc, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "var(--bg-card)",
              border: tc.isHidden ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Test Case #{idx + 1}</span>
                {tc.isHidden ? <Badge variant="warning">Hidden Evaluation Case</Badge> : <Badge variant="neutral">Public Sample</Badge>}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={tc.isHidden}
                    onChange={(e) => handleChangeRow(idx, "isHidden", e.target.checked)}
                    style={{ accentColor: "#f59e0b", cursor: "pointer" }}
                  />
                  {tc.isHidden ? <EyeOff size={14} color="#f59e0b" /> : <Eye size={14} />}
                  <span>Mark Hidden</span>
                </label>

                {testCases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                    title="Remove test case"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>TEST CASE INPUT</label>
              <textarea
                value={tc.input}
                onChange={(e) => handleChangeRow(idx, "input", e.target.value)}
                placeholder="e.g. [2,7,11,15]&#10;9"
                style={{
                  width: "100%",
                  height: "72px",
                  backgroundColor: "var(--bg-surface)",
                  color: "#ffffff",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px",
                  fontSize: "13px",
                  fontFamily: "var(--font-mono)",
                  outline: "none",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* JSON Import Modal */}
      {showJsonModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "540px",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-bright)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={20} /> Batch Import JSON Test Cases
              </h3>
              <button type="button" onClick={() => setShowJsonModal(false)} style={{ background: "transparent", border: "none", color: "#a3a3a3", cursor: "pointer", fontSize: "18px" }}>✕</button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Paste a JSON array of test cases below.
            </p>

            {jsonError && (
              <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", fontSize: "12px" }}>
                {jsonError}
              </div>
            )}

            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`[\n  { "input": "5", "output": "120", "isHidden": false },\n  { "input": "0", "output": "1", "isHidden": true }\n]`}
              style={{
                width: "100%",
                height: "160px",
                backgroundColor: "var(--bg-surface)",
                color: "#ffffff",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                padding: "12px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowJsonModal(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleImportJson} icon={<Check size={14} />}>
                Import Test Cases
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
