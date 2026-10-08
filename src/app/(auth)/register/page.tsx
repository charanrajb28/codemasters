"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfileAction } from "@/actions/auth-actions";
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
import { Terminal, Lock, Mail, User, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsPending(false);
      return;
    }

    try {
      // Step 1: Create user in Firebase Auth
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      // Step 2: Update Firebase Auth display name
      await updateProfile(credential.user, { displayName: name });

      // Step 3: Get ID token
      const idToken = await credential.user.getIdToken();

      // Step 4: Write Firestore user doc + create session cookie via server action
      const result = await createUserProfileAction(
        credential.user.uid,
        name,
        email,
        idToken
      );

      if (result?.error) {
        setError(result.error);
        setIsPending(false);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      setIsPending(false);
      console.error("Client registration error:", err);
      const code = (err as { code?: string }).code;
      const message = (err as { message?: string }).message;

      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Try signing in.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (message) {
        setError(message);
      } else {
        setError("Registration failed. Please try again.");
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
            Create an Account
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Join the DSA Platform for coding assessments
          </p>
        </div>

        <Card glass style={{ border: "1px solid var(--border-bright)" }}>
          <form method="POST" onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Register</CardTitle>
              <CardDescription>Enter your details to create a student account</CardDescription>
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
                label="Full Name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                icon={<User size={16} />}
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="user@example.com"
                required
                icon={<Mail size={16} />}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
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
                icon={<UserPlus size={16} />}
              >
                {isPending ? "Creating Account..." : "Register Account"}
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
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "#ffffff", fontWeight: 600, textDecoration: "underline" }}
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
