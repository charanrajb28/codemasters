"use client";

import React from "react";
import { CheckCircle2, XCircle, Clock, Cpu, AlertTriangle } from "lucide-react";

export interface SubmissionVerdictData {
  status: string;
  execTimeMs?: number | null;
  memoryUsedKb?: number | null;
  totalTestCases: number;
  passedTestCases: number;
  stdout?: string | null;
  stderr?: string | null;
}

interface SubmissionVerdictViewProps {
  verdict: SubmissionVerdictData;
}

export function SubmissionVerdictView({ verdict }: SubmissionVerdictViewProps) {
  if (!verdict) return null;

  const isAccepted = verdict.status === "ACCEPTED";
  const errorOutput = verdict.stderr?.trim();
  const memoryMb = verdict.memoryUsedKb ? (verdict.memoryUsedKb / 1024).toFixed(1) : null;

  const getVerdictTitle = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "Accepted!";
      case "WRONG_ANSWER":
        return "Wrong Answer";
      case "TIME_LIMIT_EXCEEDED":
        return "Time Limit Exceeded (TLE)";
      case "MEMORY_LIMIT_EXCEEDED":
        return "Memory Limit Exceeded (MLE)";
      case "RUNTIME_ERROR":
        return "Runtime Error";
      case "COMPILATION_ERROR":
        return "Compilation Error";
      default:
        return status;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontFamily: "var(--font-sans), 'Inter', sans-serif" }}>
      {/* Top Banner */}
      <div
        style={{
          padding: "20px",
          borderRadius: "14px",
          backgroundColor: isAccepted ? "rgba(6, 78, 59, 0.4)" : "rgba(136, 19, 55, 0.4)",
          border: isAccepted ? "1px solid #065f46" : "1px solid #9f1239",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          boxShadow: isAccepted ? "0 4px 25px rgba(16, 185, 129, 0.2)" : "0 4px 25px rgba(244, 63, 94, 0.2)",
        }}
      >
        {isAccepted ? (
          <CheckCircle2 style={{ width: 40, height: 40, color: "#34d399", flexShrink: 0 }} />
        ) : (
          <XCircle style={{ width: 40, height: 40, color: "#f87171", flexShrink: 0 }} />
        )}

        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 900, color: isAccepted ? "#34d399" : "#f87171", margin: 0, letterSpacing: "-0.02em" }}>
            {getVerdictTitle(verdict.status)}
          </h2>
          <p style={{ fontSize: "13px", fontFamily: "monospace", color: "#d4d4d8", margin: "4px 0 0 0" }}>
            {verdict.passedTestCases} / {verdict.totalTestCases} Test Cases Passed
          </p>
        </div>
      </div>

      {/* Telemetry Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontFamily: "monospace", fontSize: "12px" }}>
        <div style={{ padding: "14px 16px", borderRadius: "12px", backgroundColor: "#0c0c0e", border: "1px solid #27272a", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#a1a1aa" }}>
            <Clock style={{ width: 15, height: 15, color: "#34d399" }} />
            <span>Execution Time</span>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>
            {verdict.execTimeMs !== null && verdict.execTimeMs !== undefined ? `${verdict.execTimeMs} ms` : "—"}
          </div>
        </div>

        <div style={{ padding: "14px 16px", borderRadius: "12px", backgroundColor: "#0c0c0e", border: "1px solid #27272a", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#a1a1aa" }}>
            <Cpu style={{ width: 15, height: 15, color: "#fbbf24" }} />
            <span>Memory Footprint</span>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>
            {memoryMb ? `${memoryMb} MB` : "—"}
          </div>
        </div>
      </div>

      {/* Successful submissions stay focused on the verdict. Worker stdout is
          intentionally omitted; only actionable errors are shown below. */}
      {isAccepted && !errorOutput && (
        <div style={{ padding: "14px 16px", borderRadius: "12px", backgroundColor: "rgba(6, 78, 59, 0.18)", border: "1px solid rgba(52, 211, 153, 0.22)", color: "#a7f3d0", fontSize: "13px" }}>
          All test cases passed. Your solution is ready to submit.
        </div>
      )}

      {/* Only actionable error output is shown. */}
      {errorOutput && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "11px", fontFamily: "monospace", textTransform: "uppercase", color: "#f87171", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle style={{ width: 13, height: 13 }} />
            <span>Error Details</span>
          </label>
          <pre style={{ margin: 0, padding: "14px 16px", backgroundColor: "rgba(127, 29, 29, 0.2)", border: "1px solid rgba(248, 113, 113, 0.35)", borderRadius: "12px", color: "#fecaca", fontSize: "12px", lineHeight: 1.6, fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre-wrap" }}>
            {errorOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
