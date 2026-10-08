"use client";

import React from "react";
import { Terminal, ShieldAlert } from "lucide-react";

interface ProblemDescriptionFormatterProps {
  description: string;
}

interface ParsedExample {
  title: string;
  input: string;
  output: string;
  explanation?: string;
}

interface ParsedDoc {
  descriptionParagraphs: string[];
  examples: ParsedExample[];
  constraints: string[];
}

export const ProblemDescriptionFormatter: React.FC<ProblemDescriptionFormatterProps> = ({
  description,
}) => {
  if (!description) return null;

  const doc = parseDoc(description);

  return (
    <div
      style={{
        color: "#d4d4d8",
        fontSize: "14px",
        lineHeight: "1.7",
        fontFamily: "var(--font-sans), 'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* 1. Main Problem Description Paragraphs */}
      {doc.descriptionParagraphs.map((para, idx) => (
        <p key={idx} style={{ margin: 0, color: "#d4d4d8", lineHeight: "1.7" }}>
          {renderInlineFormatted(para)}
        </p>
      ))}

      {/* 2. Examples Section */}
      {doc.examples.map((ex, idx) => (
        <div key={idx} style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 10px",
                borderRadius: "6px",
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                fontSize: "12px",
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              <Terminal style={{ width: 13, height: 13, color: "#34d399" }} />
              {ex.title}
            </span>
          </div>

          {/* Example Card Container */}
          <div
            style={{
              padding: "14px 16px",
              backgroundColor: "#0c0c0e",
              border: "1px solid #27272a",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Input Row */}
            {ex.input && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontFamily: "monospace", fontSize: "13px" }}>
                <span style={{ color: "#a1a1aa", fontWeight: 700, flexShrink: 0, minWidth: "65px", paddingTop: "2px" }}>
                  Input:
                </span>
                <span
                  style={{
                    color: "#f4f4f5",
                    backgroundColor: "#18181b",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    border: "1px solid #27272a",
                    wordBreak: "break-all",
                    flex: 1,
                  }}
                >
                  {renderInlineFormatted(ex.input)}
                </span>
              </div>
            )}

            {/* Output Row */}
            {ex.output && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontFamily: "monospace", fontSize: "13px" }}>
                <span style={{ color: "#34d399", fontWeight: 700, flexShrink: 0, minWidth: "65px", paddingTop: "2px" }}>
                  Output:
                </span>
                <span
                  style={{
                    color: "#34d399",
                    backgroundColor: "rgba(6, 78, 59, 0.3)",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    border: "1px solid #065f46",
                    wordBreak: "break-all",
                    fontWeight: 600,
                    flex: 1,
                  }}
                >
                  {renderInlineFormatted(ex.output)}
                </span>
              </div>
            )}

            {/* Explanation Row */}
            {ex.explanation && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "13px",
                  paddingTop: "8px",
                  borderTop: "1px solid #1c1c20",
                }}
              >
                <span style={{ color: "#fbbf24", fontWeight: 700, flexShrink: 0, minWidth: "65px" }}>
                  Explanation:
                </span>
                <span style={{ color: "#a1a1aa", lineHeight: "1.5" }}>
                  {renderInlineFormatted(ex.explanation)}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 3. Constraints Section */}
      {doc.constraints.length > 0 && (
        <div
          style={{
            marginTop: "8px",
            padding: "16px",
            backgroundColor: "#0c0c0e",
            border: "1px solid #27272a",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#a1a1aa",
              fontWeight: 700,
            }}
          >
            <ShieldAlert style={{ width: 14, height: 14, color: "#fbbf24" }} />
            <span>Problem Constraints:</span>
          </div>
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              margin: 0,
              paddingLeft: "4px",
              listStyle: "none",
            }}
          >
            {doc.constraints.map((c, cIdx) => (
              <li
                key={cIdx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  color: "#d4d4d8",
                }}
              >
                <span style={{ color: "#10b981", fontSize: "10px" }}>▶</span>
                <span>{renderInlineFormatted(c)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Robust parser to separate description text, examples, and constraints
function parseDoc(rawText: string): ParsedDoc {
  // Normalize line endings
  let text = rawText.replace(/\r\n/g, "\n");

  // Strip redundant title if text starts with "## Title"
  text = text.replace(/^##\s+[^\n]+\n+/, "");

  let constraints: string[] = [];
  let examples: ParsedExample[] = [];
  let descriptionParagraphs: string[] = [];

  // Step A: Extract Constraints
  const constraintsIdx = text.search(/(?:###?\s*Constraints|\bConstraints:?)/i);
  if (constraintsIdx !== -1) {
    const constrText = text.substring(constraintsIdx);
    text = text.substring(0, constraintsIdx); // Remove constraints from main text

    // Clean constraints text lines
    const lines = constrText.split("\n");
    for (let line of lines) {
      let trimmed = line.trim();
      if (!trimmed) continue;
      if (/^###?\s*Constraints/i.test(trimmed) || /^Constraints:?/i.test(trimmed)) continue;

      // Remove leading bullet marker (- , * , • ) ONLY at line start
      trimmed = trimmed.replace(/^[-*•]\s*/, "");
      if (trimmed) {
        constraints.push(trimmed);
      }
    }
  }

  // Step B: Extract Examples vs Main Description Text
  // Find all example section starts: "### Example 1", "Example 1:", "Example:", etc.
  const exampleHeaderRegex = /(?:^|\n)(?:###?\s*)?(Example(?:\s*\d+)?[:\s]*)/gi;
  const matches: Array<{ index: number; length: number; title: string }> = [];
  let m: RegExpExecArray | null;

  while ((m = exampleHeaderRegex.exec(text)) !== null) {
    matches.push({
      index: m.index,
      length: m[0].length,
      title: m[1].trim().replace(/[:\s]+$/, ""),
    });
  }

  if (matches.length > 0) {
    // Description text is everything before the first example
    const firstExIndex = matches[0].index;
    const descText = text.substring(0, firstExIndex).trim();
    if (descText) {
      descriptionParagraphs = descText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    }

    // Extract each example chunk
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const nextIndex = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const rawChunk = text.substring(current.index + current.length, nextIndex);

      const parsedEx = extractExampleFields(current.title, rawChunk);
      // ONLY push if input or output is present (prevents empty example cards!)
      if (parsedEx.input || parsedEx.output) {
        examples.push(parsedEx);
      }
    }
  } else {
    // No explicit example headers found — check if text contains inline "Input:" or "Output:"
    if (/Input:/i.test(text) && /Output:/i.test(text)) {
      const parsedEx = extractExampleFields("Example 1", text);
      if (parsedEx.input || parsedEx.output) {
        examples.push(parsedEx);
      }
    } else {
      // Entire text is description
      descriptionParagraphs = text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    }
  }

  return {
    descriptionParagraphs,
    examples,
    constraints,
  };
}

// Helper to extract Input, Output, Explanation from an example text chunk
function extractExampleFields(rawTitle: string, textChunk: string): ParsedExample {
  let clean = textChunk.replace(/```/g, "").trim();

  let input = "";
  let output = "";
  let explanation = "";

  const inputMatch = clean.match(/Input:\s*([\s\S]*?)(?=(Output:|Explanation:|$))/i);
  const outputMatch = clean.match(/Output:\s*([\s\S]*?)(?=(Explanation:|$))/i);
  const expMatch = clean.match(/Explanation:\s*([\s\S]*?)$/i);

  if (inputMatch) input = inputMatch[1].trim();
  if (outputMatch) output = outputMatch[1].trim();
  if (expMatch) explanation = expMatch[1].trim();

  // Ensure title has proper numbering format (e.g. "Example 1")
  let title = rawTitle || "Example 1";
  if (!/\d/.test(title)) {
    title = "Example 1";
  }

  return {
    title,
    input,
    output,
    explanation: explanation || undefined,
  };
}

// Inline formatting helper (**bold**, `code`)
function renderInlineFormatted(text: string): React.ReactNode[] {
  if (!text) return [];
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "#ffffff", fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          style={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            color: "#fbbf24",
            padding: "2px 6px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
