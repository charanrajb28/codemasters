import { Sandbox } from "@vercel/sandbox";
import { SupportedLanguage } from "@/lib/language-boilerplate";
import { adminDb } from "@/lib/firebase-admin";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SandboxRunRequest {
  language: SupportedLanguage;
  code: string;
  input: string;
  timeoutMs?: number;
}

export interface SandboxRunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  execTimeMs: number;
  timedOut: boolean;
  error?: string;
  engine: "vercel-sandbox";
}

/** One test case to run inside the sandbox batch */
export interface BatchTestCase {
  /** Parsed arguments to pass to solve() */
  args: unknown[];
  /** Expected JSON output string (e.g. "[0,1]"). Empty string = no check. */
  expected: string;
}

/** Per-test result returned by the sandbox driver */
export interface BatchTestCaseResult {
  passed: boolean;
  actual: string;
  error?: string;
  execTimeMs?: number;
}

/** What the sandbox stdout must look like */
interface SandboxBatchOutput {
  results: BatchTestCaseResult[];
}

export interface BatchRunRequest {
  language: SupportedLanguage;
  /** The user's code (just their function body, e.g. def solve(...)) */
  code: string;
  /** Driver template from DB — must contain {{USER_CODE}} */
  driverCode: string;
  testCases: BatchTestCase[];
  timeoutMs?: number;
}

export interface BatchRunResult {
  results: BatchTestCaseResult[];
  execTimeMs: number;
  engine: "vercel-sandbox";
}

export interface ExecutionRequest {
  submissionId: string;
  problemId: string;
  userId: string;
  language: string;
  code: string;
}

export interface ExecutionResult {
  status: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED" | "RUNTIME_ERROR" | "COMPILATION_ERROR";
  execTimeMs: number;
  memoryUsedKb: number;
  totalTestCases: number;
  passedTestCases: number;
  stdout?: string;
  stderr?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function normalizeLanguage(language: string): SupportedLanguage {
  const lang = (language || "python").toLowerCase().trim();
  if (lang === "py") return "python";
  if (lang === "c++") return "cpp";
  if (lang === "js" || lang === "ts" || lang === "typescript") return "javascript";
  if (["python", "cpp", "java", "javascript"].includes(lang)) return lang as SupportedLanguage;
  return "python";
}

/**
 * Parse a multi-line test case input string into an args array.
 * e.g. "[2,7,11,15]\n9" → [[2,7,11,15], 9]
 */
export function parseInputToArgs(input: string): unknown[] {
  return input
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return line;
      }
    });
}

function getRunScript(lang: SupportedLanguage): string {
  switch (lang) {
    case "python":     return "python3 solution.py < input.txt";
    case "javascript": return "node solution.js < input.txt";
    case "cpp":        return "g++ -O2 solution.cpp -o solution && ./solution < input.txt";
    case "java":       return "javac Solution.java && java Solution < input.txt";
  }
}

function getSolutionFilename(lang: SupportedLanguage): string {
  switch (lang) {
    case "python":     return "solution.py";
    case "javascript": return "solution.js";
    case "cpp":        return "solution.cpp";
    case "java":       return "Solution.java";
  }
}

// ─── Core Vercel Sandbox Runner ───────────────────────────────────────────────

async function runWithVercelSandbox(req: SandboxRunRequest): Promise<SandboxRunResult> {
  const timeoutMs = req.timeoutMs || 15000;
  const filename  = getSolutionFilename(req.language);
  const runScript = getRunScript(req.language);

  const sandbox = await Sandbox.create({
    timeout: Math.max(timeoutMs + 10000, 25000),
    resources: { vcpus: 1 },
  });

  const startTime = Date.now();
  try {
    await sandbox.writeFiles([
      { path: filename,    content: req.code },
      { path: "input.txt", content: req.input },
    ]);

    const command = await sandbox.runCommand({
      cmd: "bash",
      args: ["-c", runScript],
      timeoutMs,
    });

    const [stdout, stderr] = await Promise.all([
      command.stdout().catch(() => ""),
      command.stderr().catch(() => ""),
    ]);

    const execTimeMs = Date.now() - startTime;
    const exitCode   = command.exitCode ?? 0;

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode,
      execTimeMs,
      timedOut: exitCode === 124 || stderr.includes("timed out"),
      engine: "vercel-sandbox",
    };
  } finally {
    await sandbox.stop().catch(() => { });
  }
}

export async function runInSandbox(req: SandboxRunRequest): Promise<SandboxRunResult> {
  try {
    return await runWithVercelSandbox(req);
  } catch (err: any) {
    console.error("[SandboxRunner] Vercel Sandbox error:", err);
    throw new Error(
      "Failed to execute in Vercel Sandbox. Please ensure VERCEL_TOKEN and VERCEL_PROJECT_ID are configured. Details: " +
      (err.message || String(err))
    );
  }
}

// ─── Batch Runner (all test cases in one sandbox call) ────────────────────────

/**
 * Runs ALL test cases inside a single sandbox execution.
 * The driver code must contain {{USER_CODE}} and must read a JSON payload from
 * stdin in the shape: { testCases: [{ args: any[], expected: string }] }
 * and print a JSON object: { results: [{ passed, actual, error? }] }
 */
export async function runBatchTestCases(req: BatchRunRequest): Promise<BatchRunResult> {
  if (!req.driverCode.includes("{{USER_CODE}}")) {
    throw new Error(
      "[SandboxRunner] Driver code must contain {{USER_CODE}} placeholder. Update the problem template in the admin panel."
    );
  }

  const fullCode = req.driverCode.replace("{{USER_CODE}}", req.code);
  const payload  = JSON.stringify({ testCases: req.testCases });

  console.log("[SandboxRunner] Batch run | lang:", req.language, "| test cases:", req.testCases.length);
  console.log("[SandboxRunner] Args per TC:", req.testCases.map(tc => JSON.stringify(tc.args)));
  console.log("[SandboxRunner] User code (first 400 chars):", req.code.slice(0, 400));

  const sandboxResult = await runInSandbox({
    language: req.language,
    code:     fullCode,
    input:    payload,
    timeoutMs: req.timeoutMs ?? 20000,
  });

  if (sandboxResult.timedOut) {
    // Mark all as TLE
    return {
      results: req.testCases.map(() => ({
        passed: false,
        actual: "",
        error: "TIME_LIMIT_EXCEEDED",
      })),
      execTimeMs: sandboxResult.execTimeMs,
      engine: "vercel-sandbox",
    };
  }

  if (!sandboxResult.stdout) {
    const errMsg = sandboxResult.stderr || "No output from sandbox";
    return {
      results: req.testCases.map(() => ({
        passed: false,
        actual: "",
        error: errMsg,
      })),
      execTimeMs: sandboxResult.execTimeMs,
      engine: "vercel-sandbox",
    };
  }

  try {
    const parsed = JSON.parse(sandboxResult.stdout) as SandboxBatchOutput;
    return {
      results: parsed.results,
      execTimeMs: sandboxResult.execTimeMs,
      engine: "vercel-sandbox",
    };
  } catch {
    // stdout wasn't JSON — surface it as a runtime error for all test cases
    const errMsg = `Runtime Error: ${sandboxResult.stderr || sandboxResult.stdout}`;
    return {
      results: req.testCases.map(() => ({
        passed: false,
        actual: "",
        error: errMsg,
      })),
      execTimeMs: sandboxResult.execTimeMs,
      engine: "vercel-sandbox",
    };
  }
}

// ─── Submission Job ───────────────────────────────────────────────────────────

export async function processSubmissionJob(req: ExecutionRequest): Promise<ExecutionResult> {
  const startTime = Date.now();
  console.log(`[SandboxRunner] Processing submission ${req.submissionId}...`);

  await adminDb.collection("submissions").doc(req.submissionId).set(
    { status: "RUNNING", executionEngine: "vercel-sandbox", updatedAt: new Date().toISOString() },
    { merge: true }
  );

  try {
    const problemDoc = await adminDb.collection("problems").doc(req.problemId).get();
    if (!problemDoc.exists) throw new Error(`Problem ${req.problemId} not found.`);

    const lang = normalizeLanguage(req.language);
    const dbTemplate = problemDoc.data()?.templates?.[lang];
    const driverCode: string | undefined = dbTemplate?.driverTemplate ?? dbTemplate?.driverCode;

    if (!driverCode?.includes("{{USER_CODE}}")) {
      throw new Error(
        `Problem ${req.problemId} has no valid driver template for ${lang}. ` +
        "Go to Admin → Edit Problem → Templates and add a driver with {{USER_CODE}}."
      );
    }

    const testCasesSnap = await adminDb
      .collection("problems")
      .doc(req.problemId)
      .collection("testCases")
      .get();

    const testCases: BatchTestCase[] = testCasesSnap.docs.map((doc) => {
      const data = doc.data() as { input: string; output: string };
      return {
        args: parseInputToArgs(data.input || ""),
        expected: (data.output || "").trim(),
      };
    });

    const totalTestCases = Math.max(1, testCases.length);

    const batch = await runBatchTestCases({
      language: lang,
      code: req.code,
      driverCode,
      testCases,
      timeoutMs: 20000,
    });

    let passedTestCases = 0;
    let overallStatus: ExecutionResult["status"] = "ACCEPTED";
    const stdoutLogs: string[] = [];
    const stderrLogs: string[] = [];

    for (let i = 0; i < batch.results.length; i++) {
      const r = batch.results[i];
      if (r.error) {
        const isTle = r.error.includes("TIME_LIMIT_EXCEEDED");
        const isCompile = /SyntaxError|javac|g\+\+|undefined reference/i.test(r.error);
        overallStatus = isTle ? "TIME_LIMIT_EXCEEDED" : isCompile ? "COMPILATION_ERROR" : "RUNTIME_ERROR";
        stderrLogs.push(`Test Case ${i + 1} Error: ${r.error}`);
        break;
      }
      if (r.passed) {
        passedTestCases++;
        stdoutLogs.push(`Test Case ${i + 1}: Passed ✓ (actual: ${r.actual})`);
      } else {
        overallStatus = "WRONG_ANSWER";
        stderrLogs.push(
          `Test Case ${i + 1}: Expected "${testCases[i].expected}", Got "${r.actual}"`
        );
        break;
      }
    }

    const result: ExecutionResult = {
      status: overallStatus,
      execTimeMs: Math.max(batch.execTimeMs, Date.now() - startTime),
      memoryUsedKb: 0,
      totalTestCases,
      passedTestCases,
      stdout: stdoutLogs.join("\n"),
      stderr: stderrLogs.length ? stderrLogs.join("\n") : undefined,
    };

    await adminDb.collection("submissions").doc(req.submissionId).set(
      { ...result, stderr: result.stderr ?? null, executionEngine: "vercel-sandbox", updatedAt: new Date().toISOString() },
      { merge: true }
    );

    return result;
  } catch (err: any) {
    const message = err.message || String(err);
    console.error(`[SandboxRunner] Execution error for ${req.submissionId}:`, err);
    await adminDb.collection("submissions").doc(req.submissionId).set(
      { status: "RUNTIME_ERROR", stderr: message, executionEngine: "vercel-sandbox", updatedAt: new Date().toISOString() },
      { merge: true }
    );
    return {
      status: "RUNTIME_ERROR",
      execTimeMs: Date.now() - startTime,
      memoryUsedKb: 0,
      totalTestCases: 1,
      passedTestCases: 0,
      stderr: message,
    };
  }
}
