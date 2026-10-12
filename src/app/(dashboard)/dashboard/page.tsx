import React from "react";
import {
  Code2,
  ShieldAlert,
  ArrowRight,
  Play,
  Terminal,
  Clock,
  ChevronRight,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getStudentProblemsAction } from "@/actions/student-actions";

export default async function DashboardPage() {
  const session = await getSession();
  const res = await getStudentProblemsAction().catch(() => ({ success: false, data: [] }));
  const problems = res?.success && Array.isArray(res.data) ? res.data : [];

  const userName = session?.name || session?.email?.split("@")[0] || "Engineer";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <div style={{ maxWidth: "1240px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
      <style>{`
        .dashboard-two-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: stretch;
        }
        .stats-2x2-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          height: 100%;
        }
        @media (max-width: 960px) {
          .dashboard-two-sections {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 540px) {
          .stats-2x2-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ─── TOP SECTION: 2 EQUAL-WIDTH SECTIONS ─── */}
      <div className="dashboard-two-sections">
        {/* ─── SECTION 1 (LEFT): PROFILE CARD WITH EDIT BUTTON ON AVATAR (NO BADGES) ─── */}
        <div
          style={{
            position: "relative",
            backgroundColor: "rgba(18, 18, 22, 0.65)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "24px",
          }}
        >
          {/* Profile Identity Details (No Badges) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              {/* User Avatar with Edit Button */}
              <div style={{ position: "relative", display: "inline-block", flexShrink: 0 }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "18px",
                    background: "linear-gradient(135deg, #10b981 0%, #064e3b 100%)",
                    border: "1.5px solid rgba(52, 211, 153, 0.3)",
                    boxShadow: "0 6px 18px -4px rgba(16, 185, 129, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontSize: "24px",
                    fontWeight: 800,
                  }}
                >
                  {userInitials}
                </div>

                {/* Edit Button on Avatar */}
                <button
                  type="button"
                  title="Edit Profile Avatar"
                  aria-label="Edit Profile"
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    right: "-4px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "#1c1c22",
                    border: "1.5px solid #3f3f46",
                    color: "#e4e4e7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.7)",
                    transition: "transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease",
                  }}
                >
                  <Pencil size={11} />
                </button>
              </div>

              {/* User Text Details (No Badges) */}
              <div>
                <span style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: 500, letterSpacing: "0.02em" }}>
                  Developer Account
                </span>
                <h1
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#ffffff",
                    letterSpacing: "-0.02em",
                    margin: "2px 0 0",
                    lineHeight: 1.2,
                  }}
                >
                  {userName}
                </h1>
                <div style={{ fontSize: "12px", color: "#71717a", fontFamily: "var(--font-mono), monospace", marginTop: "4px" }}>
                  {session?.email || "student@codemasters.io"}
                </div>
              </div>
            </div>

            {/* Context Box (No Badges) */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "14px",
                padding: "16px",
              }}
            >
              <p style={{ fontSize: "13.5px", color: "#a1a1aa", margin: 0, lineHeight: 1.55 }}>
                Ready to execute code in isolated container pods. Select a problem from the library to start solving.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              href="/problems"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 20px",
                borderRadius: "12px",
                backgroundColor: "#10b981",
                color: "#000000",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(16, 185, 129, 0.35)",
                transition: "transform 0.15s ease",
              }}
            >
              <Code2 size={16} />
              <span>Solve Problems</span>
              <ArrowRight size={14} />
            </Link>

            {session?.role === "ADMIN" && (
              <Link
                href="/admin"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 20px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "13.5px",
                  textDecoration: "none",
                }}
              >
                <ShieldAlert size={16} style={{ color: "#fbbf24" }} />
                <span>Admin Portal</span>
              </Link>
            )}
          </div>
        </div>

        {/* ─── SECTION 2 (RIGHT): 4 CARDS (EQUAL WIDTH TO LEFT, NO BADGES, NO SVGS) ─── */}
        <div className="stats-2x2-grid">
          {/* Card 1: Available Challenges (NO BADGE, NO SVG) */}
          <div
            style={{
              backgroundColor: "rgba(18, 18, 22, 0.65)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Available Challenges
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", marginTop: "6px" }}>
                {problems.length}
              </div>
            </div>

            <div style={{ width: "100%", height: "4px", borderRadius: "999px", backgroundColor: "#27272a", overflow: "hidden" }}>
              <div style={{ width: "100%", height: "100%", backgroundColor: "#10b981", borderRadius: "999px" }} />
            </div>
          </div>

          {/* Card 2: Active Streak (NO BADGE, NO SVG) */}
          <div
            style={{
              backgroundColor: "rgba(18, 18, 22, 0.65)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Active Streak
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", marginTop: "6px" }}>
                1 Day
              </div>
            </div>

            <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div
                  key={day}
                  style={{
                    flex: 1,
                    height: "4px",
                    borderRadius: "999px",
                    backgroundColor: day === 1 ? "#fbbf24" : "#27272a",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Card 3: Execution Memory Limit (NO BADGE, NO SVG) */}
          <div
            style={{
              backgroundColor: "rgba(18, 18, 22, 0.65)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Execution Memory Limit
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", marginTop: "6px" }}>
                256 MB
              </div>
            </div>

            <div style={{ width: "100%", height: "4px", borderRadius: "999px", backgroundColor: "#27272a", overflow: "hidden" }}>
              <div style={{ width: "65%", height: "100%", backgroundColor: "#60a5fa", borderRadius: "999px" }} />
            </div>
          </div>

          {/* Card 4: Account Tier (NO BADGE, NO SVG) */}
          <div
            style={{
              backgroundColor: "rgba(18, 18, 22, 0.65)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Account Tier
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginTop: "6px" }}>
                {session?.role || "STUDENT"}
              </div>
            </div>

            <div style={{ width: "100%", height: "4px", borderRadius: "999px", backgroundColor: "#27272a", overflow: "hidden" }}>
              <div style={{ width: "100%", height: "100%", backgroundColor: "#a855f7", borderRadius: "999px" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── FEATURED CODING PROBLEMS ─── */}
      <div style={{ marginTop: "12px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Algorithmic Problem Set
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", margin: "2px 0 0" }}>
              Featured Coding Problems
            </h2>
          </div>

          <Link
            href="/problems"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13.5px",
              color: "#34d399",
              textDecoration: "none",
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.18)",
              transition: "background-color 0.15s ease",
            }}
          >
            <span>View All Problems</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        {/* Problem Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
          {problems.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "48px 24px",
                textAlign: "center",
                borderRadius: "18px",
                backgroundColor: "rgba(18, 18, 22, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                color: "#a1a1aa",
              }}
            >
              <Terminal size={32} style={{ margin: "0 auto 12px", color: "#52525b" }} />
              <p style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}>No challenges available in this category yet.</p>
            </div>
          ) : (
            problems.slice(0, 4).map((problem) => {
              const isEasy = problem.difficulty === "Easy";
              const isMedium = problem.difficulty === "Medium";

              return (
                <div
                  key={problem.id}
                  style={{
                    position: "relative",
                    backgroundColor: "rgba(18, 18, 22, 0.65)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "20px",
                    padding: "24px",
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "20px",
                    transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  {/* Top Bar: Difficulty + Runtime Limit */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.03em",
                          backgroundColor: isEasy
                            ? "rgba(16, 185, 129, 0.12)"
                            : isMedium
                            ? "rgba(245, 158, 11, 0.12)"
                            : "rgba(239, 68, 68, 0.12)",
                          color: isEasy ? "#34d399" : isMedium ? "#fbbf24" : "#f87171",
                          border: isEasy
                            ? "1px solid rgba(16, 185, 129, 0.25)"
                            : isMedium
                            ? "1px solid rgba(245, 158, 11, 0.25)"
                            : "1px solid rgba(239, 68, 68, 0.25)",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: isEasy ? "#34d399" : isMedium ? "#fbbf24" : "#f87171",
                          }}
                        />
                        {problem.difficulty}
                      </span>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontFamily: "var(--font-mono), monospace", color: "#71717a" }}>
                        <Clock size={13} />
                        <span>{(problem as any).timeLimit ?? 2000}ms limit</span>
                      </div>
                    </div>

                    {/* Problem Title */}
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#ffffff",
                        letterSpacing: "-0.015em",
                        margin: "0 0 12px",
                        lineHeight: 1.3,
                      }}
                    >
                      {problem.title}
                    </h3>

                    {/* Tags List */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {problem.tags.map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(255, 255, 255, 0.04)",
                            color: "#a1a1aa",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            fontWeight: 500,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom: Action Button */}
                  <div
                    style={{
                      paddingTop: "16px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#71717a", fontWeight: 500 }}>
                      Isolated Pod Ready
                    </span>

                    <Link
                      href={`/problems/${problem.slug}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(16, 185, 129, 0.14)",
                        color: "#34d399",
                        border: "1px solid rgba(16, 185, 129, 0.28)",
                        fontSize: "13px",
                        fontWeight: 600,
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Play size={13} fill="#34d399" />
                      <span>Solve Challenge</span>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
