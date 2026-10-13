"use server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { createSession, clearSession } from "@/lib/session";
import { redirect } from "next/navigation";

/**
 * Called from the login page AFTER Firebase client-side signInWithEmailAndPassword.
 * Receives the ID token, verifies it, creates a server session cookie, and redirects.
 */
export async function createSessionAction(idToken: string): Promise<{ error?: string; success?: boolean; role?: string }> {
  try {
    // Verify the ID token is genuine
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Check user exists and is not suspended in Firestore
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) {
      return { error: "Account not found. Please register first." };
    }

    const userData = userDoc.data()!;
    if (userData.isSuspended) {
      return { error: "Your account has been suspended. Contact support." };
    }

    const role = userData.role ?? "STUDENT";

    // Set the role as a custom claim on the Firebase Auth user
    try {
      await adminAuth.setCustomUserClaims(decoded.uid, { role });
    } catch (claimErr) {
      console.warn("setCustomUserClaims warning:", claimErr);
    }

    // Create the session cookie with role
    await createSession(idToken, role);
    return { success: true, role };
  } catch (err: unknown) {
    console.error("createSessionAction error:", err);
    return { error: "Authentication failed. Please try again." };
  }
}

/**
 * Called from the register page AFTER Firebase client-side createUserWithEmailAndPassword.
 * Writes the Firestore user document and creates the session.
 */
export async function createUserProfileAction(
  uid: string,
  name: string,
  email: string,
  idToken: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await adminAuth.verifyIdToken(idToken);

    // Write user doc to Firestore
    await adminDb.collection("users").doc(uid).set({
      name,
      email,
      role: "STUDENT",
      isSuspended: false,
      createdAt: new Date().toISOString(),
    });

    // Set custom role claims (non-blocking if warning occurs)
    try {
      await adminAuth.setCustomUserClaims(uid, { role: "STUDENT" });
    } catch (claimErr) {
      console.warn("setCustomUserClaims non-fatal warning:", claimErr);
    }

    // Create session cookie
    await createSession(idToken, "STUDENT");
    return { success: true };
  } catch (err: unknown) {
    console.error("createUserProfileAction error:", err);
    const message = (err as Error)?.message || "Registration failed on server.";
    return { error: message };
  }
}

/**
 * Clear the session cookie and redirect to login.
 */
export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}

/**
 * Update current user profile (display name) in Firestore
 */
export async function updateCurrentUserProfileAction(
  name: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { getSession } = await import("@/lib/session");
    const session = await getSession();
    if (!session?.uid) {
      return { error: "Unauthorized. Please sign in again." };
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      return { error: "Name cannot be empty." };
    }

    await adminDb.collection("users").doc(session.uid).update({
      name: trimmedName,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("updateCurrentUserProfileAction error:", err);
    return { error: (err as Error)?.message || "Failed to update profile." };
  }
}
