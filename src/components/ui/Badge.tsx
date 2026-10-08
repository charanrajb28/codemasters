import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error" | "info" | "neutral";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  style,
  className = "",
  ...props
}) => {
  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: "9999px",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    backgroundColor:
      variant === "success"
        ? "rgba(16, 185, 129, 0.15)"
        : variant === "warning"
        ? "rgba(245, 158, 11, 0.15)"
        : variant === "error"
        ? "rgba(239, 68, 68, 0.15)"
        : variant === "info"
        ? "rgba(59, 130, 246, 0.15)"
        : "rgba(255, 255, 255, 0.1)",
    color:
      variant === "success"
        ? "#34d399"
        : variant === "warning"
        ? "#fbbf24"
        : variant === "error"
        ? "#f87171"
        : variant === "info"
        ? "#60a5fa"
        : "#e5e5e5",
    border:
      variant === "success"
        ? "1px solid rgba(16, 185, 129, 0.3)"
        : variant === "warning"
        ? "1px solid rgba(245, 158, 11, 0.3)"
        : variant === "error"
        ? "1px solid rgba(239, 68, 68, 0.3)"
        : variant === "info"
        ? "1px solid rgba(59, 130, 246, 0.3)"
        : "1px solid var(--border-color)",
    ...style,
  };

  return (
    <span style={badgeStyle} className={className} {...props}>
      {children}
    </span>
  );
};
