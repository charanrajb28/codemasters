"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { FieldValue, Query } from "firebase-admin/firestore";

export type UserRole = "STUDENT" | "ADMIN";

export interface AdminUserItem {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isSuspended: boolean;
  createdAt: string;
  submissionCount: number;
}

export async function getUsersAction(
  query?: string,
  roleFilter?: string
): Promise<AdminUserItem[]> {
  try {
    let ref: any = adminDb.collection("users").orderBy("createdAt", "desc");

    if (roleFilter === "STUDENT" || roleFilter === "ADMIN") {
      ref = ref.where("role", "==", roleFilter);
    }

    const snapshot = await ref.limit(200).get();
    let users: AdminUserItem[] = snapshot.docs.map((doc: any) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name ?? null,
        email: d.email,
        role: d.role ?? "STUDENT",
        isSuspended: d.isSuspended ?? false,
        createdAt: d.createdAt ?? new Date().toISOString(),
        submissionCount: d.submissionCount ?? 0,
      };
    });

    // Client-side text filter (Firestore doesn't support full-text search)
    if (query && query.trim() !== "") {
      const q = query.toLowerCase();
      users = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    return users;
  } catch (err) {
    console.error("getUsersAction error:", err);
    return [];
  }
}

export async function updateUserRoleAction(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection("users").doc(userId).update({ role: newRole });
    // Sync the custom claim so middleware JWT reflects the new role immediately
    await adminAuth.setCustomUserClaims(userId, { role: newRole });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    console.error("updateUserRoleAction error:", err);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function toggleUserSuspensionAction(
  userId: string
): Promise<{ success: boolean; isSuspended?: boolean; error?: string }> {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) return { success: false, error: "User not found" };

    const current = userDoc.data()!.isSuspended ?? false;
    const next = !current;

    await adminDb.collection("users").doc(userId).update({ isSuspended: next });
    revalidatePath("/admin/users");
    return { success: true, isSuspended: next };
  } catch (err) {
    console.error("toggleUserSuspensionAction error:", err);
    return { success: false, error: "Failed to toggle suspension state" };
  }
}

export async function getTelemetryStatsAction() {
  try {
    const [usersSnap, problemsSnap, submissionsSnap] = await Promise.all([
      adminDb.collection("users").count().get(),
      adminDb.collection("problems").count().get(),
      adminDb.collection("submissions").count().get(),
    ]);

    const totalUsers = usersSnap.data().count;
    const totalProblems = problemsSnap.data().count;
    const totalSubmissions = submissionsSnap.data().count;

    // Fetch verdict breakdown
    const statusSnap = await adminDb
      .collection("submissions")
      .select("status")
      .limit(2000)
      .get();

    const statusMap: Record<string, number> = {};
    statusSnap.docs.forEach((d: any) => {
      const s = d.data().status as string;
      statusMap[s] = (statusMap[s] ?? 0) + 1;
    });

    const acceptedCount = statusMap["ACCEPTED"] ?? 0;
    const acceptanceRate =
      totalSubmissions > 0
        ? ((acceptedCount / totalSubmissions) * 100).toFixed(1)
        : "100";

    const verdictData = [
      { name: "Accepted", value: statusMap["ACCEPTED"] ?? 0, color: "#10b981" },
      { name: "Wrong Answer", value: statusMap["WRONG_ANSWER"] ?? 0, color: "#ef4444" },
      { name: "Time Limit", value: statusMap["TIME_LIMIT_EXCEEDED"] ?? 0, color: "#f59e0b" },
      { name: "Memory Limit", value: statusMap["MEMORY_LIMIT_EXCEEDED"] ?? 0, color: "#8b5cf6" },
      { name: "Runtime Error", value: statusMap["RUNTIME_ERROR"] ?? 0, color: "#6b7280" },
    ];

    const volumeData = [
      { day: "Mon", submissions: 24 },
      { day: "Tue", submissions: 38 },
      { day: "Wed", submissions: 45 },
      { day: "Thu", submissions: 52 },
      { day: "Fri", submissions: 60 },
      { day: "Sat", submissions: 30 },
      { day: "Sun", submissions: 42 },
    ];

    return {
      kpis: {
        totalSubmissions: totalSubmissions || 0,
        acceptanceRate: `${acceptanceRate}%`,
        activeUsers: totalUsers,
        totalProblems,
        queueHealth: "Healthy",
      },
      verdictData,
      volumeData,
    };
  } catch (err) {
    console.error("getTelemetryStatsAction error:", err);
    return {
      kpis: { totalSubmissions: 0, acceptanceRate: "0%", activeUsers: 0, totalProblems: 0, queueHealth: "Error" },
      verdictData: [],
      volumeData: [],
    };
  }
}
