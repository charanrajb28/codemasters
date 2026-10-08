"use client";

import React, { useState } from "react";
import { Terminal, CheckCircle2, Copy, Check } from "lucide-react";

interface CodeSnippet {
  lang: string;
  filename: string;
  runtime: string;
  memory: string;
  beats: string;
  code: string;
}

const SNIPPETS: Record<string, CodeSnippet> = {
  python: {
    lang: "Python 3.11",
    filename: "two_sum.py",
    runtime: "38 ms",
    memory: "14.8 MB",
    beats: "94.2%",
    code: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Hash map complement lookup in O(N) time
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
  },
  cpp: {
    lang: "C++20 (GCC)",
    filename: "two_sum.cpp",
    runtime: "4 ms",
    memory: "10.4 MB",
    beats: "98.7%",
    code: `#include <vector>
#include <unordered_map>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
  },
  java: {
    lang: "Java OpenJDK 17",
    filename: "Solution.java",
    runtime: "2 ms",
    memory: "42.1 MB",
    beats: "96.4%",
    code: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
  },
  javascript: {
    lang: "JavaScript Node 20",
    filename: "twoSum.js",
    runtime: "52 ms",
    memory: "43.6 MB",
    beats: "91.5%",
    code: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
  },
};

export const CodeDemoTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("python");
  const [copied, setCopied] = useState<boolean>(false);

  const snippet = SNIPPETS[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "880px",
        borderRadius: "16px",
        backgroundColor: "#09090b",
        border: "1px solid #27272a",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(52, 211, 153, 0.12)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        margin: "0 auto",
      }}
    >
      {/* Top Header Bar & Tabs */}
      <div
        style={{
          backgroundColor: "#121215",
          borderBottom: "1px solid #27272a",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Window Control Buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#eab308" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
          </div>

          {/* Language Selector Tabs */}
          <div style={{ display: "flex", gap: "4px", backgroundColor: "#050505", padding: "3px", borderRadius: "8px", border: "1px solid #27272a" }}>
            {Object.keys(SNIPPETS).map((key) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: active ? 700 : 500,
                    fontFamily: "var(--font-sans), 'Figtree', sans-serif",
                    color: active ? "#ffffff" : "#a1a1aa",
                    backgroundColor: active ? "#18181b" : "transparent",
                    border: active ? "1px solid #3f3f46" : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {key.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Runtime Badge & Copy Code Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#34d399", display: "flex", alignItems: "center", gap: "6px" }}>
            <Terminal size={13} />
            <span>{snippet.lang}</span>
          </div>

          <button
            onClick={handleCopy}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "6px",
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              color: "#a1a1aa",
              fontSize: "11px",
              cursor: "pointer",
            }}
            title="Copy snippet"
          >
            {copied ? <Check size={13} style={{ color: "#34d399" }} /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div
        style={{
          padding: "24px 28px",
          fontFamily: "var(--font-mono), 'Fira Code', 'JetBrains Mono', monospace",
          fontSize: "13.5px",
          lineHeight: 1.7,
          color: "#e4e4e7",
          backgroundColor: "#09090b",
          overflowX: "auto",
          textAlign: "left",
          whiteSpace: "pre",
        }}
      >
        {snippet.code}
      </div>

      {/* Execution Verdict Bar */}
      <div
        style={{
          padding: "12px 24px",
          backgroundColor: "#121215",
          borderTop: "1px solid #27272a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontWeight: 700 }}>
            <CheckCircle2 size={16} />
            <span>Accepted</span>
          </div>
          <span style={{ color: "#3f3f46" }}>|</span>
          <span style={{ fontFamily: "var(--font-mono)", color: "#a1a1aa" }}>
            Runtime: <strong style={{ color: "#ffffff" }}>{snippet.runtime}</strong> <span style={{ color: "#34d399" }}>(Beats {snippet.beats})</span>
          </span>
          <span style={{ color: "#3f3f46" }}>|</span>
          <span style={{ fontFamily: "var(--font-mono)", color: "#a1a1aa" }}>
            Memory: <strong style={{ color: "#ffffff" }}>{snippet.memory}</strong>
          </span>
        </div>

        <span
          style={{
            fontFamily: "var(--font-mono)",
            color: "#34d399",
            backgroundColor: "rgba(52, 211, 153, 0.1)",
            border: "1px solid rgba(52, 211, 153, 0.25)",
            padding: "3px 10px",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "11px",
          }}
        >
          3/3 Test Cases Passed
        </span>
      </div>
    </div>
  );
};
