"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface AdminProblemItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  memoryLimit: number;
  tags: string[];
  paramCount: number;
  paramNames: string[];
  jsRunner: string;
  jsChecker: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    testCases: number;
    submissions: number;
  };
}

const DEFAULT_JS_RUNNER = `// JS Runner: Reference solution that generates EXPECTED OUTPUT for any input.
// Receives: inputs (string[]) — the raw parameter values from the test case UI
// Must return: the expected output (will be JSON.stringify'd if object)
//
// HOW IT WORKS:
//   - The JS Runner runs in the BROWSER (not on Kubernetes).
//   - It computes the correct answer from the inputs.
//   - When a student adds a custom test case, this auto-generates the expected output.
//   - When "Run Code" is clicked, this re-generates expected output for each test case.
//
// Example for "Two Sum":
// const [nums, target] = inputs.map(x => JSON.parse(x));
// const seen = {};
// for (let i = 0; i < nums.length; i++) {
//   const comp = target - nums[i];
//   if (seen[comp] !== undefined) return JSON.stringify([seen[comp], i]);
//   seen[nums[i]] = i;
// }
// return JSON.stringify([]);
//
// Replace the example above with the actual reference solution for this problem.
const [nums, target] = inputs.map(x => { try { return JSON.parse(x); } catch { return x; } });
const seen = {};
for (let i = 0; i < nums.length; i++) {
  const comp = target - nums[i];
  if (seen[comp] !== undefined) return JSON.stringify([seen[comp], i]);
  seen[nums[i]] = i;
}
return JSON.stringify([]);`;

const DEFAULT_JS_CHECKER = `// JS Checker: Compares actual output (from Kubernetes) vs expected output (from JS Runner).
// Receives: actualOutput (string), expectedOutput (string), inputs (string[])
// Must return: { passed: boolean, message: string }
try {
  if (!expectedOutput || expectedOutput.trim() === "" || expectedOutput === "N/A") {
    return { passed: true, message: "No expected output to compare against." };
  }
  const normalize = (s) => {
    try { return JSON.stringify(JSON.parse(String(s).trim())); }
    catch { return String(s).trim(); }
  };
  const cleanActual = normalize(actualOutput);
  const cleanExpected = normalize(expectedOutput);
  const passed = cleanActual === cleanExpected;
  return {
    passed,
    message: passed
      ? "Output matched expected result!"
      : \`Output mismatch. Expected: \${cleanExpected}, Got: \${cleanActual}\`
  };
} catch (err) {
  return { passed: false, message: "Checker evaluation error: " + err.message };
}`;

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface LanguageTemplate {
  starterCode: string;
  driverCode: string;
  driverTemplate?: string;
}

export type LanguageTemplates = {
  python: LanguageTemplate;
  cpp: LanguageTemplate;
  java: LanguageTemplate;
  javascript: LanguageTemplate;
};

const TEMPLATE_LANGUAGES = ["python", "cpp", "java", "javascript"] as const;

function normalizeTemplates(raw: unknown): LanguageTemplates {
  const source = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>;
  const normalized: Record<string, LanguageTemplate> = {};

  for (const language of TEMPLATE_LANGUAGES) {
    const item = source[language] ?? {};
    const starterCode = typeof item.starterCode === "string" ? item.starterCode : "";
    let driverTemplate = typeof item.driverTemplate === "string"
      ? item.driverTemplate
      : typeof item.driverCode === "string" ? item.driverCode : "";

    // Older records may contain a complete driver but no separate template.
    // Recover the insertion marker when the saved starter is present.
    if (!driverTemplate.includes("{{USER_CODE}}") && starterCode && driverTemplate.includes(starterCode)) {
      driverTemplate = driverTemplate.replace(starterCode, "{{USER_CODE}}");
    }

    const driverCode = driverTemplate.includes("{{USER_CODE}}")
      ? driverTemplate.replace("{{USER_CODE}}", starterCode)
      : driverTemplate;

    normalized[language] = { starterCode, driverCode, driverTemplate };
  }

  return normalized as LanguageTemplates;
}

export async function getAdminProblemsAction(): Promise<AdminProblemItem[]> {
  try {

    const snap = await adminDb
      .collection("problems")
      .orderBy("createdAt", "desc")
      .get();

    const problems: AdminProblemItem[] = await Promise.all(
      snap.docs.map(async (doc) => {
        const d = doc.data();

        const [testCasesSnap, submissionsSnap] = await Promise.all([
          adminDb.collection("problems").doc(doc.id).collection("testCases").count().get(),
          adminDb.collection("submissions").where("problemId", "==", doc.id).count().get(),
        ]);

        return {
          id: doc.id,
          title: d.title,
          slug: d.slug,
          description: d.description,
          difficulty: d.difficulty,
          timeLimit: d.timeLimit ?? 2000,
          memoryLimit: d.memoryLimit ?? 256,
          tags: d.tags ?? [],
          paramCount: d.paramCount ?? 2,
          paramNames: d.paramNames ?? ["param1", "param2"],
          jsRunner: d.jsRunner ?? DEFAULT_JS_RUNNER,
          jsChecker: d.jsChecker ?? DEFAULT_JS_CHECKER,
          createdAt: d.createdAt ?? new Date().toISOString(),
          updatedAt: d.updatedAt ?? new Date().toISOString(),
          _count: {
            testCases: testCasesSnap.data().count,
            submissions: submissionsSnap.data().count,
          },
        };
      })
    );

    return problems;
  } catch (err) {
    console.error("getAdminProblemsAction error:", err);
    return [];
  }
}

export interface DetailedProblemWithTestCases {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  timeLimit: number;
  memoryLimit: number;
  tags: string[];
  paramCount: number;
  paramNames: string[];
  jsRunner: string;
  jsChecker: string;
  templates: LanguageTemplates;
  testCases: {
    id: string;
    input: string;
    output: string;
    isHidden: boolean;
  }[];
}

export async function getProblemWithTestCasesAction(
  id: string
): Promise<DetailedProblemWithTestCases | null> {
  try {
    const problemDoc = await adminDb.collection("problems").doc(id).get();
    if (!problemDoc.exists) return null;

    const testCasesSnap = await adminDb
      .collection("problems")
      .doc(id)
      .collection("testCases")
      .get();

    const testCases = testCasesSnap.docs.map((tc) => {
      const data = tc.data();
      return {
        id: tc.id,
        input: (data.input as string) ?? "",
        output: (data.output as string) ?? "",
        isHidden: !!data.isHidden,
      };
    });

    const d = problemDoc.data()!;
    return {
      id: problemDoc.id,
      title: (d.title as string) ?? "",
      difficulty: (d.difficulty as string) ?? "Easy",
      description: (d.description as string) ?? "",
      timeLimit: (d.timeLimit as number) ?? 2000,
      memoryLimit: (d.memoryLimit as number) ?? 256,
      tags: (d.tags as string[]) ?? [],
      paramCount: (d.paramCount as number) ?? 2,
      paramNames: (d.paramNames as string[]) ?? ["param1", "param2"],
      jsRunner: (d.jsRunner as string) ?? DEFAULT_JS_RUNNER,
      jsChecker: (d.jsChecker as string) ?? DEFAULT_JS_CHECKER,
      templates: (d.templates as LanguageTemplates) ?? null,
      testCases,
    };
  } catch (err) {
    console.error("getProblemWithTestCasesAction error:", err);
    return null;
  }
}

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s-]+/g, "-") +
    "-" +
    Date.now().toString().slice(-4)
  );
}

export async function createProblemAction(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const title = formData.get("title") as string;
    const difficulty = formData.get("difficulty") as string;
    const description = formData.get("description") as string;
    const timeLimit = parseInt(formData.get("timeLimit") as string, 10) || 2000;
    const memoryLimit = parseInt(formData.get("memoryLimit") as string, 10) || 256;
    const paramCount = parseInt(formData.get("paramCount") as string, 10) || 2;
    const paramNamesRaw = formData.get("paramNames") as string;
    const jsRunner = (formData.get("jsRunner") as string) || DEFAULT_JS_RUNNER;
    const jsChecker = (formData.get("jsChecker") as string) || DEFAULT_JS_CHECKER;
    const tagsRaw = formData.get("tags") as string;
    const testCasesJson = formData.get("testCasesJson") as string;
    const templatesJson = formData.get("templatesJson") as string;

    if (!title || !description) {
      return "Title and description are required.";
    }

    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    const paramNames = paramNamesRaw
      ? paramNamesRaw.split(",").map((p) => p.trim()).filter((p) => p.length > 0)
      : Array.from({ length: paramCount }, (_, i) => `param${i + 1}`);

    let testCases: { input: string; output: string; isHidden?: boolean }[] = [];
    if (testCasesJson) {
      try {
        testCases = JSON.parse(testCasesJson);
      } catch {
        return "Invalid test cases format.";
      }
    }

    let templates: LanguageTemplates | null = null;
    if (templatesJson) {
      try {
        templates = normalizeTemplates(JSON.parse(templatesJson));
      } catch {
        return "Invalid templates JSON format.";
      }
    }

    const now = new Date().toISOString();
    const docRef = adminDb.collection("problems").doc();

    await docRef.set({
      title,
      slug: generateSlug(title),
      difficulty,
      description,
      timeLimit,
      memoryLimit,
      tags,
      paramCount,
      paramNames,
      jsRunner,
      jsChecker,
      ...(templates ? { templates } : {}),
      createdAt: now,
      updatedAt: now,
    });

    // Write test cases as sub-collection
    const batch = adminDb.batch();
    for (const tc of testCases) {
      const tcRef = docRef.collection("testCases").doc();
      batch.set(tcRef, {
        input: tc.input || "",
        output: tc.output || "",
        isHidden: !!tc.isHidden,
      });
    }
    await batch.commit();

    revalidatePath("/admin/problems");
    revalidatePath("/problems");
  } catch (err) {
    console.error("createProblemAction error:", err);
    return "Failed to create problem. Please check your inputs.";
  }

  redirect("/admin/problems");
}

export async function updateProblemAction(
  id: string,
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const title = formData.get("title") as string;
    const difficulty = formData.get("difficulty") as string;
    const description = formData.get("description") as string;
    const timeLimit = parseInt(formData.get("timeLimit") as string, 10) || 2000;
    const memoryLimit = parseInt(formData.get("memoryLimit") as string, 10) || 256;
    const paramCount = parseInt(formData.get("paramCount") as string, 10) || 2;
    const paramNamesRaw = formData.get("paramNames") as string;
    const jsRunner = (formData.get("jsRunner") as string) || DEFAULT_JS_RUNNER;
    const jsChecker = (formData.get("jsChecker") as string) || DEFAULT_JS_CHECKER;
    const tagsRaw = formData.get("tags") as string;
    const testCasesJson = formData.get("testCasesJson") as string;
    const templatesJson = formData.get("templatesJson") as string;

    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    const paramNames = paramNamesRaw
      ? paramNamesRaw.split(",").map((p) => p.trim()).filter((p) => p.length > 0)
      : Array.from({ length: paramCount }, (_, i) => `param${i + 1}`);

    let testCases: { input: string; output: string; isHidden?: boolean }[] = [];
    if (testCasesJson) {
      try {
        testCases = JSON.parse(testCasesJson);
      } catch {
        return "Invalid test cases JSON format.";
      }
    }

    let templates: LanguageTemplates | null = null;
    if (templatesJson) {
      try {
        templates = normalizeTemplates(JSON.parse(templatesJson));
      } catch {
        return "Invalid templates JSON format.";
      }
    }

    await adminDb.collection("problems").doc(id).update({
      title,
      difficulty,
      description,
      timeLimit,
      memoryLimit,
      tags,
      paramCount,
      paramNames,
      jsRunner,
      jsChecker,
      ...(templates ? { templates } : {}),
      updatedAt: new Date().toISOString(),
    });

    // Replace test cases: delete existing, write new batch
    const existingTCs = await adminDb
      .collection("problems")
      .doc(id)
      .collection("testCases")
      .get();

    const deleteBatch = adminDb.batch();
    existingTCs.docs.forEach((doc) => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();

    if (testCases.length > 0) {
      const addBatch = adminDb.batch();
      for (const tc of testCases) {
        const tcRef = adminDb.collection("problems").doc(id).collection("testCases").doc();
        addBatch.set(tcRef, {
          input: tc.input || "",
          output: tc.output || "",
          isHidden: !!tc.isHidden,
        });
      }
      await addBatch.commit();
    }

    revalidatePath("/admin/problems");
    revalidatePath(`/admin/problems/${id}/edit`);
    revalidatePath("/problems");
  } catch (err) {
    console.error("updateProblemAction error:", err);
    return "Failed to update problem.";
  }

  redirect("/admin/problems");
}

export async function deleteProblemAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete sub-collection test cases first
    const testCasesSnap = await adminDb
      .collection("problems")
      .doc(id)
      .collection("testCases")
      .get();
    const batch = adminDb.batch();
    testCasesSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    await adminDb.collection("problems").doc(id).delete();

    revalidatePath("/admin/problems");
    revalidatePath("/problems");
    return { success: true };
  } catch (err) {
    console.error("deleteProblemAction error:", err);
    return { success: false, error: "Failed to delete problem" };
  }
}
