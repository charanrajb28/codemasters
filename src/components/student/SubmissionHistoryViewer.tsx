"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, Cpu, Eye, EyeOff, Code2, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface HistoricalSubmission {
  id: string;
  language: string;
  code: string;
  status: string;
  execTimeMs?: number | null;
  memoryUsedKb?: number | null;
  createdAt: string | Date;
}

interface SubmissionHistoryViewerProps {
  submissions: HistoricalSubmission[];
}

export function SubmissionHistoryViewer({ submissions }: SubmissionHistoryViewerProps) {
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getVerdictBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge variant="success">Accepted</Badge>;
      case "WRONG_ANSWER":
        return <Badge variant="error">Wrong Answer</Badge>;
      case "TIME_LIMIT_EXCEEDED":
        return <Badge variant="warning">TLE</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "var(--font-sans), 'Inter', sans-serif" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "12px",
          borderBottom: "1px solid #262626",
        }}
      >
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <Clock style={{ width: 16, height: 16, color: "#34d399", flexShrink: 0 }} />
          <span>Past Submissions ({submissions.length})</span>
        </h3>
      </div>

      {/* Empty State */}
      {submissions.length === 0 ? (
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            color: "#a1a1aa",
            fontFamily: "monospace",
            fontSize: "12px",
            border: "1px dashed #27272a",
            borderRadius: "12px",
            backgroundColor: "#0c0c0e",
          }}
        >
          No submission history found for this problem yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {submissions.map((sub) => {
            const isExpanded = expandedSubmissionId === sub.id;
            const memoryMb = sub.memoryUsedKb ? (sub.memoryUsedKb / 1024).toFixed(1) : "—";
            const dateStr = new Date(sub.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={sub.id}
                style={{
                  padding: "14px 16px",
                  backgroundColor: "#0c0c0e",
                  border: "1px solid #27272a",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  transition: "all 0.15s ease",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
                }}
              >
                {/* Main Card Content Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                  {/* Left Group: Verdict Badge + Language + Date */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    {getVerdictBadge(sub.status)}

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#ffffff", fontWeight: 700, textTransform: "uppercase" }}>
                        {sub.language}
                      </span>
                      <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#a1a1aa" }}>
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  {/* Right Group: Runtime + Memory + View Code Button */}
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "11px", fontFamily: "monospace", color: "#a1a1aa" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock style={{ width: 12, height: 12, color: "#34d399" }} />
                        <span style={{ color: "#ffffff", fontWeight: 600 }}>{sub.execTimeMs ? `${sub.execTimeMs} ms` : "—"}</span>
                      </span>

                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Cpu style={{ width: 12, height: 12, color: "#fbbf24" }} />
                        <span style={{ color: "#ffffff", fontWeight: 600 }}>{memoryMb} MB</span>
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedSubmissionId(isExpanded ? null : sub.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 12px",
                        fontSize: "12px",
                        fontFamily: "var(--font-sans), sans-serif",
                        fontWeight: 600,
                        backgroundColor: isExpanded ? "#262626" : "#18181b",
                        color: "#ffffff",
                        border: "1px solid #3f3f46",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff style={{ width: 13, height: 13, color: "#a1a1aa" }} />
                          <span>Hide Code</span>
                        </>
                      ) : (
                        <>
                          <Eye style={{ width: 13, height: 13, color: "#34d399" }} />
                          <span>View Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Inline Expandable Code Block */}
                {isExpanded && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      paddingTop: "12px",
                      borderTop: "1px solid #1f1f23",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <label style={{ fontSize: "11px", fontFamily: "monospace", textTransform: "uppercase", color: "#a1a1aa", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                        <Code2 style={{ width: 13, height: 13, color: "#34d399" }} />
                        <span>Submitted Solution ({sub.language}):</span>
                      </label>

                      <button
                        onClick={() => handleCopyCode(sub.id, sub.code)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          fontSize: "11px",
                          fontFamily: "monospace",
                          backgroundColor: "#18181b",
                          border: "1px solid #27272a",
                          borderRadius: "4px",
                          color: copiedId === sub.id ? "#34d399" : "#a1a1aa",
                          cursor: "pointer",
                        }}
                      >
                        {copiedId === sub.id ? (
                          <>
                            <Check style={{ width: 12, height: 12 }} /> Copied
                          </>
                        ) : (
                          <>
                            <Copy style={{ width: 12, height: 12 }} /> Copy
                          </>
                        )}
                      </button>
                    </div>

                    <pre
                      style={{
                        padding: "12px 14px",
                        backgroundColor: "#000000",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                        color: "#34d399",
                        fontSize: "12px",
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        maxHeight: "320px",
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.5",
                      }}
                    >
                      {sub.code}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
