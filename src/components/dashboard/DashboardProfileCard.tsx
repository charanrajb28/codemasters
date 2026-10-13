"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2, ShieldAlert, ArrowRight, Pencil, X, Check, Loader2 } from "lucide-react";
import { updateCurrentUserProfileAction } from "@/actions/auth-actions";

interface DashboardProfileCardProps {
  session?: {
    uid?: string;
    name?: string;
    email?: string;
    role?: "STUDENT" | "ADMIN";
  } | null;
}

export const DashboardProfileCard: React.FC<DashboardProfileCardProps> = ({ session }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState(session?.name || session?.email?.split("@")[0] || "Engineer");
  const [inputName, setInputName] = useState(displayName);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  const userInitials = displayName.charAt(0).toUpperCase();

  const handleOpenModal = () => {
    setInputName(displayName);
    setErrorMsg("");
    setSuccessMsg(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) {
      setErrorMsg("Display name cannot be empty.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg(false);

    try {
      const res = await updateCurrentUserProfileAction(inputName.trim());
      if (res.error) {
        setErrorMsg(res.error);
        setIsSaving(false);
      } else {
        setDisplayName(inputName.trim());
        setSuccessMsg(true);
        setIsSaving(false);
        router.refresh();
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg(false);
        }, 800);
      }
    } catch {
      setErrorMsg("An unexpected error occurred while saving.");
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* ─── PROFILE CARD (LEFT EQUAL-WIDTH SECTION) ─── */}
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
          height: "100%",
          boxSizing: "border-box",
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
                  userSelect: "none",
                }}
              >
                {userInitials}
              </div>

              {/* Edit Pop-up Button directly on Avatar */}
              <button
                type="button"
                onClick={handleOpenModal}
                title="Edit Profile"
                aria-label="Edit Profile"
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  right: "-4px",
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  backgroundColor: "#18181b",
                  border: "1.5px solid #3f3f46",
                  color: "#e4e4e7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.8)",
                  transition: "transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#27272a";
                  e.currentTarget.style.borderColor = "#10b981";
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#18181b";
                  e.currentTarget.style.borderColor = "#3f3f46";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Pencil size={12} />
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
                {displayName}
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

      {/* ─── EDIT PROFILE POP-UP MODAL ─── */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
          onClick={handleCloseModal}
        >
          {/* Modal Container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "440px",
              backgroundColor: "#111115",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "22px",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 40px rgba(16, 185, 129, 0.1)",
              padding: "28px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: "22px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <h2 id="modal-title" style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
                  Edit Profile
                </h2>
                <p style={{ fontSize: "13px", color: "#a1a1aa", margin: "4px 0 0" }}>
                  Update your developer profile details
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSaving}
                title="Close"
                style={{
                  background: "none",
                  border: "none",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  color: "#71717a",
                  padding: "6px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
              >
                <X size={18} />
              </button>
            </div>

            {/* Avatar Preview */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "14px 16px",
                borderRadius: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #10b981 0%, #064e3b 100%)",
                  border: "1.5px solid rgba(52, 211, 153, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "20px",
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {(inputName.trim() || userInitials).charAt(0).toUpperCase()}
              </div>

              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff" }}>
                  Avatar Monogram Preview
                </div>
                <div style={{ fontSize: "12px", color: "#71717a", marginTop: "2px" }}>
                  Generated automatically from your name
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Display Name Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label
                  htmlFor="displayNameInput"
                  style={{ fontSize: "12px", fontWeight: 600, color: "#d4d4d8", textTransform: "uppercase", letterSpacing: "0.04em" }}
                >
                  Full / Display Name
                </label>
                <input
                  id="displayNameInput"
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  disabled={isSaving}
                  required
                  placeholder="e.g. Charan Raj B"
                  style={{
                    backgroundColor: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "10px",
                    padding: "11px 14px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#10b981")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#27272a")}
                />
              </div>

              {/* Email (Read-Only) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={session?.email || "student@codemasters.io"}
                  disabled
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "10px",
                    padding: "11px 14px",
                    color: "#71717a",
                    fontSize: "13.5px",
                    fontFamily: "var(--font-mono), monospace",
                    cursor: "not-allowed",
                  }}
                />
              </div>

              {/* Account Tier (Read-Only) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Account Tier
                </label>
                <input
                  type="text"
                  value={session?.role || "STUDENT"}
                  disabled
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "10px",
                    padding: "11px 14px",
                    color: "#71717a",
                    fontSize: "13.5px",
                    fontFamily: "var(--font-mono), monospace",
                    cursor: "not-allowed",
                  }}
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div
                  style={{
                    fontSize: "12.5px",
                    color: "#f87171",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Success Feedback */}
              {successMsg && (
                <div
                  style={{
                    fontSize: "12.5px",
                    color: "#34d399",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Check size={14} /> Profile updated successfully!
                </div>
              )}

              {/* Modal Action Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: "11px 16px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#d4d4d8",
                    fontWeight: 600,
                    fontSize: "13.5px",
                    cursor: isSaving ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    flex: 1.4,
                    padding: "11px 16px",
                    borderRadius: "10px",
                    backgroundColor: "#10b981",
                    border: "none",
                    color: "#000000",
                    fontWeight: 700,
                    fontSize: "13.5px",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
