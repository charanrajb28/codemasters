import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = true,
  style,
  className = "",
  ...props
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: glass ? "rgba(18, 18, 18, 0.75)" : "var(--bg-card)",
    backdropFilter: glass ? "blur(12px)" : "none",
    WebkitBackdropFilter: glass ? "blur(12px)" : "none",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "20px",
    boxShadow: "var(--shadow-subtle)",
    transition: "border-color 0.2s ease, transform 0.2s ease",
    ...style,
  };

  return (
    <div style={cardStyle} className={className} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => (
  <div style={{ marginBottom: "14px", ...style }} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  style,
  ...props
}) => (
  <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em", ...style }} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  style,
  ...props
}) => (
  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", ...style }} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => <div style={{ ...style }} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => (
  <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", ...style }} {...props}>
    {children}
  </div>
);
