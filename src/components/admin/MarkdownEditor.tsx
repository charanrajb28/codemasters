"use client";

import React from "react";
import { Eye, Edit3 } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  name?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  name = "description",
}) => {
  // Simple markdown-to-formatted preview parser
  const renderPreview = (text: string) => {
    if (!text || text.trim() === "") {
      return <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Preview will render here as you type markdown...</p>;
    }

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("# ")) {
        return <h1 key={idx} style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff", margin: "16px 0 8px 0" }}>{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff", margin: "14px 0 6px 0" }}>{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", margin: "12px 0 4px 0" }}>{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("- ")) {
        return (
          <li key={idx} style={{ marginLeft: "20px", color: "var(--text-secondary)", marginBottom: "4px" }}>
            {line.replace("- ", "")}
          </li>
        );
      }
      if (line.startsWith("```")) {
        return null;
      }
      return (
        <p key={idx} style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "8px" }}>
          {line}
        </p>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Problem Description (Markdown)
      </label>

      {/* Split Pane Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", minHeight: "360px" }}>
        {/* Left Pane: Raw Editor */}
        <div style={{ display: "flex", flexDirection: "column", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#171717", padding: "8px 14px", borderBottom: "1px solid var(--border-color)", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Edit3 size={14} /> Raw Markdown Source
          </div>
          <textarea
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="## Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              minHeight: "320px",
              backgroundColor: "transparent",
              color: "#ffffff",
              padding: "14px",
              fontSize: "14px",
              fontFamily: "var(--font-mono)",
              border: "none",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>

        {/* Right Pane: Live HTML Preview */}
        <div style={{ display: "flex", flexDirection: "column", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#171717", padding: "8px 14px", borderBottom: "1px solid var(--border-color)", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Eye size={14} /> Live Formatted Preview
          </div>
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", maxHeight: "400px" }}>
            {renderPreview(value)}
          </div>
        </div>
      </div>
    </div>
  );
};
