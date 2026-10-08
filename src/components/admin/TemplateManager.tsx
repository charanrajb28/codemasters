"use client";

import React, { useState } from "react";
import { SupportedLanguage } from "@/lib/language-boilerplate";

export interface LanguageTemplate {
  starterCode: string;
  driverCode: string;
  driverTemplate?: string;
}

export type LanguageTemplates = {
  python: LanguageTemplate;
  cpp: LanguageTemplate;
  java: LanguageTemplate;
  javascript: LanguageTemplate;
};

interface TemplateManagerProps {
  initialTemplates?: LanguageTemplates | null;
}

const DEFAULT_TEMPLATES: LanguageTemplates = {
  python: { starterCode: "", driverCode: "" },
  cpp: { starterCode: "", driverCode: "" },
  java: { starterCode: "", driverCode: "" },
  javascript: { starterCode: "", driverCode: "" },
};

export const TemplateManager: React.FC<TemplateManagerProps> = ({ initialTemplates }) => {
  const [templates, setTemplates] = useState<LanguageTemplates>(initialTemplates || DEFAULT_TEMPLATES);
  const [activeLang, setActiveLang] = useState<SupportedLanguage>("python");

  const handleTemplateChange = (field: keyof LanguageTemplate, value: string) => {
    setTemplates((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        [field]: value,
      },
    }));
  };

  return (
    <div style={{ padding: "16px", backgroundColor: "#0e0e0e", border: "1px solid var(--border-bright)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "16px" }}>
      <input type="hidden" name="templatesJson" value={JSON.stringify(templates)} />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
          Language Templates (Starter & Driver Code)
        </h3>
      </div>
      <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
        Optionally define problem-specific templates. If left blank, the global defaults for that language will be used.
        <br/>
        <strong>Driver Code</strong> must contain the <code>{`{{USER_CODE}}`}</code> placeholder where the user's solution should be injected.
      </p>

      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
        {(["python", "cpp", "java", "javascript"] as SupportedLanguage[]).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveLang(lang)}
            style={{
              padding: "6px 12px",
              fontSize: "13px",
              fontWeight: 600,
              backgroundColor: activeLang === lang ? "rgba(255,255,255,0.1)" : "transparent",
              color: activeLang === lang ? "#ffffff" : "var(--text-secondary)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
            Starter Code (Editable by Student)
          </label>
          <textarea
            value={templates[activeLang].starterCode}
            onChange={(e) => handleTemplateChange("starterCode", e.target.value)}
            rows={8}
            placeholder="class Solution:&#10;    def solve(self):&#10;        pass"
            style={{
              width: "100%",
              backgroundColor: "#050505",
              color: "#e2e8f0",
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
            Driver Code (Hidden Wrapper)
          </label>
          <textarea
            value={templates[activeLang].driverTemplate ?? templates[activeLang].driverCode}
            onChange={(e) => handleTemplateChange("driverTemplate", e.target.value)}
            rows={12}
            placeholder={`import json\n\n# ── [USER CODE START] ──\n{{USER_CODE}}\n# ── [USER CODE END] ──\n\nif __name__ == '__main__':\n    print("Output")`}
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
      </div>
    </div>
  );
};
