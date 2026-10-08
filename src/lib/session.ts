// Server-side session helpers
// Reads the __session cookie, verifies the Firebase ID token with Admin SDK,
// and returns a typed user session object.

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "./firebase-admin";

export interface SessionUser {
  uid: string;
  email: string;
  name?: string;
  role: "STUDENT" | "ADMIN";
  isSuspended: boolean;
}

const SESSION_COOKIE_NAME = "__session";
const ROLE_COOKIE_NAME = "__role";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 14 * 1000; // 14 days (2 weeks) in ms — maximum allowed by Firebase Admin SDK

/**
 * Verify the session cookie and return the current user.
 * Returns null if the cookie is missing or invalid.
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, false);

    // Fetch additional user data from Firestore (role, isSuspended)
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) return null;

    const data = userDoc.data()!;
    const userRole = (data.role ?? "STUDENT") as "STUDENT" | "ADMIN";

    // Ensure role cookie is synchronized
    const currentRoleCookie = cookieStore.get(ROLE_COOKIE_NAME)?.value;
    if (currentRoleCookie !== userRole) {
      try {
        cookieStore.set(ROLE_COOKIE_NAME, userRole, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: SESSION_COOKIE_MAX_AGE / 1000,
        });
      } catch {
        // Ignore read-only cookie context errors
      }
    }

    return {
      uid: decoded.uid,
      email: decoded.email ?? data.email,
      name: data.name,
      role: userRole,
      isSuspended: data.isSuspended ?? false,
    };
  } catch {
    return null;
  }
}

/**
 * Create a Firebase session cookie from an ID token and set it as an HTTP-only cookie.
 * Called from a server action after successful Firebase client-side login.
 */
export async function createSession(idToken: string, role?: string): Promise<void> {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_COOKIE_MAX_AGE,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE / 1000,
  });

  if (role) {
    cookieStore.set(ROLE_COOKIE_NAME, role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_COOKIE_MAX_AGE / 1000,
    });
  }
}

/**
 * Clear the session cookie (logout).
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  cookieStore.set(ROLE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
