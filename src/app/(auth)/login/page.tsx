"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createSessionAction } from "@/actions/auth-actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Terminal, Lock, Mail, LogIn } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Step 1: Firebase client-side authentication
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      // Step 2: Exchange ID token for a server-side session cookie
      const result = await createSessionAction(idToken);
      if (result?.error) {
        setError(result.error);
        setIsPending(false);
      } else {
        // Full navigation to admin portal for ADMIN or dashboard for STUDENT
        window.location.href = result.role === "ADMIN" ? "/admin" : "/dashboard";
      }
    } catch (err: unknown) {
      setIsPending(false);
      const code = (err as { code?: string }).code;
      if (
        code === "auth/invalid-credential" ||
        code === "auth/user-not-found" ||
        code === "auth/wrong-password"
      ) {
        setError("Invalid email or password.");
      } else if (code === "auth/user-disabled") {
        setError("Your account has been suspended. Contact support.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#171717",
              border: "1px solid var(--border-bright)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
            }}
          >
            <Terminal size={24} />
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            DSA Execution Engine
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Sign in to access your account &amp; workspace
          </p>
        </div>

        <Card glass style={{ border: "1px solid var(--border-bright)" }}>
          <form method="POST" onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your email and password to log in</CardDescription>
            </CardHeader>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    fontSize: "13px",
                  }}
                >
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                icon={<Mail size={16} />}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                icon={<Lock size={16} />}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                variant="primary"
                style={{ width: "100%" }}
                disabled={isPending}
                icon={<LogIn size={16} />}
              >
                {isPending ? "Signing In..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "13px",
            color: "var(--text-secondary)",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            style={{ color: "#ffffff", fontWeight: 600, textDecoration: "underline" }}
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
