"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, CheckCircle2, Clock, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

export interface CatalogProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  tags: string[];
  acceptanceRate: number;
  userStatus: "SOLVED" | "ATTEMPTED" | "UNSOLVED";
}

interface ProblemCatalogTableProps {
  initialProblems: CatalogProblem[];
  allTags: string[];
  onFilterChange: (params: { search?: string; difficulty?: string; tag?: string; status?: string }) => void;
}

export function ProblemCatalogTable({
  initialProblems,
  allTags,
  onFilterChange,
}: ProblemCatalogTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [status, setStatus] = useState("All");
  const [isPending, startTransition] = useTransition();

  const handleFilterUpdate = (newSearch?: string, newDiff?: string, newTag?: string, newStatus?: string) => {
    const s = newSearch !== undefined ? newSearch : search;
    const d = newDiff !== undefined ? newDiff : difficulty;
    const t = newTag !== undefined ? newTag : selectedTag;
    const st = newStatus !== undefined ? newStatus : status;

    startTransition(() => {
      onFilterChange({ search: s, difficulty: d, tag: t, status: st });
    });
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return <Badge variant="success">Easy</Badge>;
      case "medium":
        return <Badge variant="warning">Medium</Badge>;
      case "hard":
        return <Badge variant="error">Hard</Badge>;
      default:
        return <Badge variant="neutral">{diff}</Badge>;
    }
  };

  const getStatusIcon = (userStatus: "SOLVED" | "ATTEMPTED" | "UNSOLVED") => {
    switch (userStatus) {
      case "SOLVED":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontSize: "12px", fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            <span>Solved</span>
          </div>
        );
      case "ATTEMPTED":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fbbf24", fontSize: "12px", fontWeight: 600 }}>
            <Clock size={16} />
            <span>Attempted</span>
          </div>
        );
      default:
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#525252", fontSize: "12px", fontWeight: 500 }}>
            <MinusCircle size={16} />
            <span>&mdash;</span>
          </div>
        );
    }
  };

  const selectStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#09090b",
    color: "#ffffff",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      {/* Search and Filters Card Container */}
      <div
        style={{
          padding: "20px",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "rgba(18, 18, 18, 0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border-bright)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Controls Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", alignItems: "center" }}>
          {/* Search Input */}
          <div style={{ gridColumn: "span 2", minWidth: "260px" }}>
            <Input
              type="text"
              placeholder="Search problems by title or tag..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterUpdate(e.target.value);
              }}
              icon={<Search size={16} />}
            />
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                handleFilterUpdate(undefined, e.target.value);
              }}
              style={selectStyle}
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                handleFilterUpdate(undefined, undefined, undefined, e.target.value);
              }}
              style={selectStyle}
            >
              <option value="All">All Statuses</option>
              <option value="Solved">Solved</option>
              <option value="Attempted">Attempted</option>
              <option value="Unsolved">Unsolved</option>
            </select>
          </div>

          {/* Category Tags Dropdown */}
          <div>
            <select
              value={selectedTag}
              onChange={(e) => {
                setSelectedTag(e.target.value);
                handleFilterUpdate(undefined, undefined, e.target.value);
              }}
              style={selectStyle}
            >
              <option value="All">All Category Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Pill Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
            <Filter size={14} /> Quick Filters:
          </span>

          {["All", "Easy", "Medium", "Hard"].map((d) => {
            const isActive = difficulty === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDifficulty(d);
                  handleFilterUpdate(undefined, d);
                }}
                style={{
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  backgroundColor: isActive ? "#ffffff" : "#09090b",
                  color: isActive ? "#000000" : "#a3a3a3",
                  border: isActive ? "1px solid #ffffff" : "1px solid var(--border-color)",
                }}
              >
                {d === "All" ? "All Levels" : d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Problem Catalog Table Card */}
      <div
        style={{
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-bright)",
          backgroundColor: "var(--bg-card)",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid var(--border-bright)" }}>
                <th style={{ padding: "14px 20px", fontSize: "11px", fontFamily: "monospace", textTransform: "uppercase", color: "var(--text-secondary)", width: "120px" }}>
                  Status
                </th>
                <th style={{ padding: "14px 20px", fontSize: "11px", fontFamily: "monospace", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                  Title
                </th>
                <th style={{ padding: "14px 20px", fontSize: "11px", fontFamily: "monospace", textTransform: "uppercase", color: "var(--text-secondary)", width: "130px" }}>
                  Difficulty
                </th>
                <th style={{ padding: "14px 20px", fontSize: "11px", fontFamily: "monospace", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                  Category Tags
                </th>
                <th style={{ padding: "14px 20px", fontSize: "11px", fontFamily: "monospace", textTransform: "uppercase", color: "var(--text-secondary)", width: "150px", textAlign: "right" }}>
                  Acceptance Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)", fontFamily: "monospace", fontSize: "13px" }}>
                    Loading problems...
                  </td>
                </tr>
              ) : initialProblems.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
                    No problems match your selected filters.
                  </td>
                </tr>
              ) : (
                initialProblems.map((problem) => (
                  <tr
                    key={problem.id}
                    onClick={() => router.push(`/problems/${problem.slug}`)}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      transition: "background-color 0.15s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1a1a1a")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                      {getStatusIcon(problem.userStatus)}
                    </td>
                    <td style={{ padding: "16px 20px", fontWeight: 600 }}>
                      <Link
                        href={`/problems/${problem.slug}`}
                        style={{ color: "#ffffff", textDecoration: "none", transition: "color 0.15s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#34d399")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#ffffff")}
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                      {getDifficultyBadge(problem.difficulty)}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {problem.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: "2px 8px",
                              fontSize: "11px",
                              fontFamily: "monospace",
                              borderRadius: "4px",
                              backgroundColor: "#09090b",
                              border: "1px solid #27272a",
                              color: "#a1a1aa",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right", fontFamily: "monospace", fontSize: "13px", color: "var(--text-secondary)" }}>
                      <span style={{ fontWeight: 700, color: "#ffffff" }}>{problem.acceptanceRate}%</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
