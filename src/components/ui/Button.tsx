import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "emerald";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  disabled,
  style,
  ...props
}) => {
  const isPrimary = variant === "primary" || variant === "emerald";
  const isSecondary = variant === "secondary";
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    fontWeight: 700,
    fontFamily: "var(--font-sans), 'Figtree', sans-serif",
    fontSize: size === "sm" ? "13px" : size === "lg" ? "16px" : "14px",
    padding: size === "sm" ? "8px 16px" : size === "lg" ? "14px 28px" : "10px 20px",
    gap: size === "sm" ? "6px" : "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    userSelect: "none",
    textDecoration: "none",
    boxSizing: "border-box",

    // Colors & Borders based on variant
    backgroundColor: isPrimary
      ? "#10b981"
      : isSecondary
      ? "#18181b"
      : isOutline
      ? "rgba(24, 24, 27, 0.8)"
      : isDanger
      ? "rgba(127, 29, 29, 0.4)"
      : "transparent",
    color: isPrimary
      ? "#000000"
      : isDanger
      ? "#fca5a5"
      : "#ffffff",
    border: isPrimary
      ? "1px solid #34d399"
      : isSecondary
      ? "1px solid #27272a"
      : isOutline
      ? "1px solid #3f3f46"
      : isDanger
      ? "1px solid rgba(185, 28, 28, 0.6)"
      : "1px solid transparent",
    boxShadow: isPrimary
      ? "0 4px 20px rgba(16, 185, 129, 0.3)"
      : isSecondary || isOutline
      ? "0 2px 10px rgba(0, 0, 0, 0.5)"
      : "none",
    ...style,
  };

  return (
    <button style={buttonStyle} disabled={disabled} className={className} {...props}>
      {icon && <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
