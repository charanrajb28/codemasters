"use server";

import { adminDb } from "@/lib/firebase-admin";
import { getSession } from "@/lib/session";
import { runBatchTestCases, parseInputToArgs, processSubmissionJob, normalizeLanguage } from "@/lib/sandbox-runner";

export interface StudentProblemFilterParams {
  search?: string;
  difficulty?: string;
  tag?: string;
  status?: string;
}

export async function getStudentProblemsAction(
  params: StudentProblemFilterParams = {}
) {
  try {
    const session = await getSession();
    const userId = session?.uid;
    const { search, difficulty, tag, status } = params;

    let ref = adminDb.collection("problems").orderBy("createdAt", "desc") as FirebaseFirestore.Query;

    if (difficulty && difficulty !== "All") {
      ref = ref.where("difficulty", "==", difficulty);
    }
    if (tag && tag !== "All") {
      ref = ref.where("tags", "array-contains", tag);
    }

    const snap = await ref.limit(300).get();

    let problems = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title as string,
        slug: d.slug as string,
        difficulty: d.difficulty as string,
        tags: (d.tags as string[]) ?? [],
        acceptanceRate: 0,
        userStatus: "UNSOLVED" as "SOLVED" | "ATTEMPTED" | "UNSOLVED",
      };
    });

    // Client-side search filter
    if (search && search.trim()) {
      const q = search.toLowerCase();
      problems = problems.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Fetch user submission statuses
    if (userId) {
      const subsSnap = await adminDb
        .collection("submissions")
        .where("userId", "==", userId)
        .select("problemId", "status")
        .get();

      const statusMap: Record<string, "SOLVED" | "ATTEMPTED"> = {};
      subsSnap.docs.forEach((doc) => {
        const { problemId, status: s } = doc.data() as { problemId: string; status: string };
        if (s === "ACCEPTED") {
          statusMap[problemId] = "SOLVED";
        } else if (statusMap[problemId] !== "SOLVED") {
          statusMap[problemId] = "ATTEMPTED";
        }
      });

      problems = problems.map((p) => ({
        ...p,
        userStatus: statusMap[p.id] ?? "UNSOLVED",
      }));
    }

    // Filter by user completion status
    if (status && status !== "All") {
      if (status === "Solved") problems = problems.filter((p) => p.userStatus === "SOLVED");
      else if (status === "Attempted") problems = problems.filter((p) => p.userStatus === "ATTEMPTED");
      else if (status === "Unsolved") problems = problems.filter((p) => p.userStatus === "UNSOLVED");
    }

    return { success: true, data: problems };
  } catch (err: unknown) {
    console.error("getStudentProblemsAction error:", err);
    return {
      success: false,
      error: (err as Error)?.message ?? "Failed to fetch problems.",
      data: [],
    };
  }
}

export async function getProblemDetailsAction(slug: string) {
  try {
    const snap = await adminDb
      .collection("problems")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snap.empty) return { success: false, error: "Problem not found" };

    const doc = snap.docs[0];
    const testCasesSnap = await adminDb
      .collection("problems")
      .doc(doc.id)
      .collection("testCases")
      .where("isHidden", "==", false)
      .get();

    const testCases = testCasesSnap.docs.map((tc) => ({
      id: tc.id,
      input: tc.data().input,
      output: tc.data().output,
    }));

    return {
      success: true,
      data: { id: doc.id, ...doc.data(), testCases },
    };
  } catch (err) {
    console.error("getProblemDetailsAction error:", err);
    return { success: false, error: "Failed to fetch problem." };
  }
}

export async function runSampleTestCasesAction(
  problemId: string,
  language: string,
  code: string,
  customInput?: string | string[]
) {
  try {
    const lang = normalizeLanguage(language);
    const problemDoc = await adminDb.collection("problems").doc(problemId).get();
    const dbTemplate = problemDoc.data()?.templates?.[lang];
    const driverCode = (dbTemplate?.driverTemplate ?? dbTemplate?.driverCode) as string | undefined;

    if (!driverCode?.includes("{{USER_CODE}}")) {
      return {
        success: false,
        error: `No driver template configured for ${lang}. Please add one in the Admin panel with a {{USER_CODE}} placeholder.`,
      };
    }

    // ── Custom inputs (user-typed tabs) ──────────────────────────────────────
    if (customInput !== undefined) {
      const inputs = Array.isArray(customInput) ? customInput : [customInput];
      const testCases = inputs.map((inp) => ({
        args: parseInputToArgs(inp),
        expected: "",
      }));

      const batch = await runBatchTestCases({ language: lang, code, driverCode, testCases });

      const results = inputs.map((inp, idx) => {
        const r = batch.results[idx] ?? { passed: false, actual: "", error: "No result" };
        return {
          id: `custom-${idx + 1}`,
          input: inp,
          expectedOutput: "",
          actualOutput: r.actual || "",
          passed: r.passed,
          execTimeMs: r.execTimeMs ?? batch.execTimeMs,
          stdout: r.actual ? `Output: ${r.actual}` : "",
          stderr: r.error || "",
        };
      });

      return { success: true, data: { isCustom: true, results } };
    }

    // ── Stored sample test cases (non-hidden) ─────────────────────────────────
    const testCasesSnap = await adminDb
      .collection("problems")
      .doc(problemId)
      .collection("testCases")
      .where("isHidden", "==", false)
      .get();

    const tcDocs = testCasesSnap.docs;
    const testCases = tcDocs.map((tc) => {
      const data = tc.data() as { input: string; output: string };
      return {
        args: parseInputToArgs(data.input || ""),
        expected: (data.output || "").trim(),
      };
    });

    const batch = await runBatchTestCases({ language: lang, code, driverCode, testCases });

    const results = tcDocs.map((tc, idx) => {
      const data = tc.data() as { input: string; output: string };
      const r = batch.results[idx] ?? { passed: false, actual: "", error: "No result" };
      return {
        id: tc.id ?? `sample-${idx + 1}`,
        input: data.input,
        expectedOutput: data.output || "",
        actualOutput: r.actual || "",
        passed: r.passed,
        execTimeMs: r.execTimeMs ?? batch.execTimeMs,
        stdout: r.passed ? `Test Case ${idx + 1}: Passed ✓` : `Test Case ${idx + 1}: Wrong Answer`,
        stderr: r.error || "",
      };
    });

    return { success: true, data: { isCustom: false, results } };
  } catch (err) {
    console.error("runSampleTestCasesAction error:", err);
    return { success: false, error: String((err as Error).message || err) };
  }
}


export async function submitSolutionAction(
  problemId: string,
  language: string,
  code: string
) {
  try {
    const session = await getSession();
    if (!session?.uid) {
      return { success: false, error: "Unauthorized. Please log in to submit solutions." };
    }

    const problemDoc = await adminDb.collection("problems").doc(problemId).get();
    if (!problemDoc.exists) return { success: false, error: "Problem not found" };

    const testCasesSnap = await adminDb
      .collection("problems")
      .doc(problemId)
      .collection("testCases")
      .get();

    const totalTestCases = testCasesSnap.size;

    const now = new Date().toISOString();
    const submissionRef = adminDb.collection("submissions").doc();

    await submissionRef.set({
      userId: session.uid,
      problemId,
      language,
      code,
      status: "QUEUED",
      execTimeMs: null,
      memoryUsedKb: null,
      stdout: null,
      stderr: null,
      createdAt: now,
      updatedAt: now,
    });

    // Execute submission in Vercel Sandbox asynchronously
    processSubmissionJob({
      submissionId: submissionRef.id,
      problemId,
      userId: session.uid,
      language,
      code,
    }).catch((e) => console.error("[submitSolutionAction] Sandbox execution error:", e));

    return {
      success: true,
      data: { submissionId: submissionRef.id, status: "QUEUED", totalTestCases },
    };
  } catch (err) {
    console.error("submitSolutionAction error:", err);
    return { success: false, error: "Failed to submit solution." };
  }
}

export async function getSubmissionStatusAction(submissionId: string) {
  try {
    const subDoc = await adminDb.collection("submissions").doc(submissionId).get();
    if (!subDoc.exists) return { success: false, error: "Submission not found" };

    const d = subDoc.data()!;
    const testCasesSnap = await adminDb
      .collection("problems")
      .doc(d.problemId)
      .collection("testCases")
      .count()
      .get();

    const dbTotal = testCasesSnap.data().count;
    const totalTestCases = d.totalTestCases ?? (dbTotal > 0 ? dbTotal : 1);
    const passedTestCases =
      d.passedTestCases ??
      (d.status === "ACCEPTED"
        ? totalTestCases
        : d.status === "QUEUED" || d.status === "RUNNING"
        ? 0
        : Math.max(0, totalTestCases - 1));

    return {
      success: true,
      data: {
        id: subDoc.id,
        status: d.status,
        language: d.language,
        execTimeMs: d.execTimeMs,
        memoryUsedKb: d.memoryUsedKb,
        stdout: d.stdout,
        stderr: d.stderr,
        createdAt: d.createdAt,
        totalTestCases,
        passedTestCases,
      },
    };
  } catch (err) {
    console.error("getSubmissionStatusAction error:", err);
    return { success: false, error: "Failed to get submission status." };
  }
}

export async function getProblemSubmissionsAction(problemId: string) {
  try {
    const session = await getSession();
    if (!session?.uid) return { success: true, data: [] };

    const snap = await adminDb
      .collection("submissions")
      .where("userId", "==", session.uid)
      .where("problemId", "==", problemId)
      .get();

    const submissions = snap.docs
      .map((doc) => {
        const data = doc.data();
        let createdAt = data.createdAt;
        if (createdAt && typeof createdAt.toDate === "function") {
          createdAt = createdAt.toDate().toISOString();
        }
        return { id: doc.id, ...data, createdAt };
      })
      .sort((a: any, b: any) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });

    return { success: true, data: submissions };
  } catch (err) {
    console.error("getProblemSubmissionsAction error:", err);
    return { success: true, data: [] };
  }
}

export async function getAllUserSubmissionsAction() {
  try {
    const session = await getSession();
    if (!session?.uid) return { success: true, data: [] };

    const snap = await adminDb
      .collection("submissions")
      .where("userId", "==", session.uid)
      .limit(100)
      .get();

    const submissions = snap.docs
      .map((doc) => {
        const data = doc.data();
        let createdAt = data.createdAt;
        if (createdAt && typeof createdAt.toDate === "function") {
          createdAt = createdAt.toDate().toISOString();
        }
        return { id: doc.id, ...data, createdAt };
      })
      .sort((a: any, b: any) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });

    return { success: true, data: submissions };
  } catch (err) {
    console.error("getAllUserSubmissionsAction error:", err);
    return { success: true, data: [] };
  }
}
