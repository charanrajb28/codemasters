"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  RotateCcw,
  Code,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronRight,
  EyeOff,
  Eye,
  Info,
} from "lucide-react";
import {
  LANGUAGE_BOILERPLATES,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "@/lib/language-boilerplate";

// Re-export for backward compat
export type { SupportedLanguage };
export const STARTER_TEMPLATES = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l, LANGUAGE_BOILERPLATES[l].starterCode])
) as Record<SupportedLanguage, string>;

interface MonacoCodeEditorProps {
  problemSlug: string;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  code: string;
  onCodeChange: (newCode: string) => void;
  dbTemplates?: {
    python?: { starterCode: string; driverCode: string; driverTemplate?: string };
    cpp?: { starterCode: string; driverCode: string; driverTemplate?: string };
    java?: { starterCode: string; driverCode: string; driverTemplate?: string };
    javascript?: { starterCode: string; driverCode: string; driverTemplate?: string };
  };
}

export function MonacoCodeEditor({
  problemSlug,
  language,
  onLanguageChange,
  code,
  onCodeChange,
  dbTemplates,
}: MonacoCodeEditorProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [driverExpanded, setDriverExpanded] = useState(false);

  const boilerplate = LANGUAGE_BOILERPLATES[language];
  // DB template wins over hardcoded default
  const dbTpl = dbTemplates?.[language];
  const activeStarterCode = dbTpl?.starterCode ?? boilerplate.starterCode;
  const activeDriverCode  = dbTpl?.driverTemplate ?? dbTpl?.driverCode ?? boilerplate.driverCode;

  useEffect(() => { setIsMounted(true); }, []);

  // Load code from localStorage draft on initial mount or when language changes
  useEffect(() => {
    if (!isMounted) return;
    const storageKey = `dsa_draft_${problemSlug}_${language}`;
    const savedDraft = localStorage.getItem(storageKey);
    if (savedDraft) {
      onCodeChange(savedDraft);
    } else {
      // Use DB starter if available, else fallback to default boilerplate
      onCodeChange(activeStarterCode);
    }
  }, [problemSlug, language, isMounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    onCodeChange(newCode);
    const storageKey = `dsa_draft_${problemSlug}_${language}`;
    localStorage.setItem(storageKey, newCode);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetToTemplate = () => {
    const defaultTemplate = activeStarterCode;
    onCodeChange(defaultTemplate);
    const storageKey = `dsa_draft_${problemSlug}_${language}`;
    localStorage.removeItem(storageKey);
  };

  const driverPreview = activeDriverCode;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        backgroundColor: "#0a0a0a",
        border: "1px solid #262626",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          backgroundColor: "#121212",
          borderBottom: "1px solid #262626",
          flexShrink: 0,
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {/* Language Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontFamily: "monospace", color: "#a3a3a3" }}>
            <Code style={{ width: 15, height: 15, color: "#34d399" }} />
            <span>Language:</span>
          </div>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            style={{
              padding: "4px 10px",
              fontSize: "12px",
              fontFamily: "monospace",
              backgroundColor: "#0a0a0a",
              border: "1px solid #3f3f46",
              borderRadius: "6px",
              color: "#ffffff",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {LANGUAGE_BOILERPLATES[lang].label}
              </option>
            ))}
          </select>

          {isSaved && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontFamily: "monospace", color: "#34d399" }}>
              <CheckCircle2 style={{ width: 13, height: 13 }} /> Draft Saved
            </span>
          )}
        </div>

        {/* Right Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={handleResetToTemplate}
            title="Reset to default template"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              fontSize: "12px",
              fontFamily: "var(--font-sans), sans-serif",
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "6px",
              color: "#a1a1aa",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <RotateCcw style={{ width: 13, height: 13 }} />
            <span>Reset Code</span>
          </button>
        </div>
      </div>

      {/* ── Driver Code Banner (GeeksForGeeks-style) ───────────────────── */}
      <div
        style={{
          flexShrink: 0,
          borderBottom: driverExpanded ? "1px solid #1a2a1a" : "1px solid #262626",
          backgroundColor: driverExpanded ? "#0d1a0d" : "#0f170f",
          transition: "background-color 0.2s ease",
        }}
      >
        {/* Expand/Collapse Toggle Row */}
        <button
          onClick={() => setDriverExpanded(!driverExpanded)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
            padding: "7px 16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            color: "#6ee7b7",
            fontSize: "11px",
            fontFamily: "monospace",
            letterSpacing: "0.04em",
          }}
        >
          {driverExpanded ? (
            <ChevronDown style={{ width: 14, height: 14, flexShrink: 0 }} />
          ) : (
            <ChevronRight style={{ width: 14, height: 14, flexShrink: 0 }} />
          )}
          <EyeOff style={{ width: 13, height: 13, color: "#34d399", flexShrink: 0 }} />
          <span style={{ color: "#4ade80", fontWeight: 600 }}>
            Hidden Driver Code
          </span>
          <span style={{ color: "#6b7280", marginLeft: "4px" }}>
            — {boilerplate.label} input parsing &amp; output formatting wrapper
          </span>
          {!driverExpanded && (
            <span
              style={{
                marginLeft: "auto",
                color: "#374151",
                fontSize: "10px",
                fontFamily: "monospace",
                border: "1px solid #1f2937",
                borderRadius: "4px",
                padding: "1px 6px",
                backgroundColor: "#111",
                flexShrink: 0,
              }}
            >
              click to expand
            </span>
          )}
        </button>

        {/* Expandable Driver Code View */}
        {driverExpanded && (
          <div>
            {/* Info banner */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "rgba(52,211,153,0.05)",
                borderTop: "1px solid #1a2a1a",
                borderBottom: "1px solid #1a2a1a",
              }}
            >
              <Info style={{ width: 14, height: 14, color: "#34d399", flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: "11px", color: "#6b7280", lineHeight: 1.5, fontFamily: "monospace" }}>
                This driver code is automatically prepended to your solution before execution on{" "}
                <span style={{ color: "#34d399" }}>AWS EKS Kubernetes</span>.
                It handles reading stdin, parsing inputs, calling your function, and printing the output as JSON.
                <br />
                <span style={{ color: "#d1d5db" }}>You only need to write the function body shown in the editor below.</span>
              </span>
            </div>

            {/* Driver code read-only Monaco editor */}
            <div style={{ height: "280px", position: "relative" }}>
              {isMounted ? (
                <Editor
                  height="280px"
                  language={boilerplate.monacoLang}
                  theme="vs-dark"
                  value={driverPreview}
                  options={{
                    readOnly: true,
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineNumbers: "on",
                    renderLineHighlight: "none",
                    scrollbar: { vertical: "auto", horizontal: "auto" },
                    padding: { top: 8, bottom: 8 },
                    domReadOnly: true,
                  }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "280px", color: "#6b7280", fontSize: "12px", fontFamily: "monospace" }}>
                  Loading driver code...
                </div>
              )}

              {/* "READ ONLY" badge overlay */}
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "16px",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  backgroundColor: "rgba(16,24,16,0.9)",
                  border: "1px solid #1a2a1a",
                  fontSize: "10px",
                  fontFamily: "monospace",
                  color: "#34d399",
                  pointerEvents: "none",
                  letterSpacing: "0.08em",
                }}
              >
                READ ONLY
              </div>
            </div>

            {/* Collapse button at bottom */}
            <button
              onClick={() => setDriverExpanded(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                width: "100%",
                padding: "5px",
                background: "none",
                border: "none",
                borderTop: "1px solid #1a2a1a",
                cursor: "pointer",
                color: "#4b5563",
                fontSize: "11px",
                fontFamily: "monospace",
              }}
            >
              <ChevronDown style={{ width: 14, height: 14, transform: "rotate(180deg)" }} />
              Collapse driver code
            </button>
          </div>
        )}
      </div>

      {/* ── User Code Editor ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 16px",
          backgroundColor: "#0f0f0f",
          borderBottom: "1px solid #1a1a1a",
          flexShrink: 0,
        }}
      >
        <Eye style={{ width: 13, height: 13, color: "#34d399" }} />
        <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#6b7280" }}>
          Your solution — edit below:
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, position: "relative", backgroundColor: "#1e1e1e" }}>
        {isMounted ? (
          <Editor
            height="100%"
            language={boilerplate.monacoLang}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbers: "on",
              roundedSelection: false,
              cursorStyle: "line",
              tabSize: 4,
              smoothScrolling: true,
              padding: { top: 12, bottom: 12 },
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#a1a1aa",
              fontSize: "13px",
              fontFamily: "monospace",
              gap: "8px",
            }}
          >
            <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
            <span>Loading Code Editor...</span>
          </div>
        )}
      </div>
    </div>
  );
}
