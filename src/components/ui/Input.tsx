import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = "",
  style,
  ...props
}) => {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 500,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "var(--bg-card)",
    color: "var(--text-primary)",
    border: error ? "1px solid var(--accent-danger)" : "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    padding: icon ? "10px 12px 10px 38px" : "10px 14px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    ...style,
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: "12px",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  };

  const errorStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "var(--accent-danger)",
    marginTop: "2px",
  };

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={wrapperStyle}>
        {icon && <span style={iconStyle}>{icon}</span>}
        <input style={inputStyle} className={className} {...props} />
      </div>
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
};
