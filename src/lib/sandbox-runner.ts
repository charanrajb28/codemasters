import { Sandbox } from "@vercel/sandbox";
import { LANGUAGE_BOILERPLATES, SupportedLanguage } from "@/lib/language-boilerplate";
import { adminDb } from "@/lib/firebase-admin";
import path from "path";

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
  engine: "vercel-sandbox" | "local-sandbox";
}

export interface SingleTestResult {
  actualOutput: string;
  passed: boolean;
  execTimeMs: number;
  stdout?: string;
  stderr?: string;
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

function normalizeOutput(out: string): string {
  if (!out) return "";
  const trimmed = out.trim();
  try {
    return JSON.stringify(JSON.parse(trimmed));
  } catch {
    return trimmed.replace(/\r\n/g, "\n");
  }
}

export function normalizeLanguage(language: string): SupportedLanguage {
  const lang = (language || "python").toLowerCase().trim();
  if (lang === "py") return "python";
  if (lang === "c++") return "cpp";
  if (lang === "js" || lang === "ts" || lang === "typescript") return "javascript";
  if (["python", "cpp", "java", "javascript"].includes(lang)) return lang as SupportedLanguage;
  return "python";
}

function getExecutionConfig(lang: SupportedLanguage) {
  switch (lang) {
    case "python":
      return {
        filename: "solution.py",
        runScript: "python3 solution.py < input.txt",
        localCmd: (dir: string) => `python3 "${path.join(dir, "solution.py")}" < "${path.join(dir, "input.txt")}"`,
      };
    case "javascript":
      return {
        filename: "solution.js",
        runScript: "node solution.js < input.txt",
        localCmd: (dir: string) => `node "${path.join(dir, "solution.js")}" < "${path.join(dir, "input.txt")}"`,
      };
    case "cpp":
      return {
        filename: "solution.cpp",
        runScript: "g++ -O3 solution.cpp -o solution && ./solution < input.txt",
        localCmd: (dir: string) => `g++ -O3 "${path.join(dir, "solution.cpp")}" -o "${path.join(dir, "solution")}" && "${path.join(dir, "solution")}" < "${path.join(dir, "input.txt")}"`,
      };
    case "java":
      return {
        filename: "Solution.java",
        runScript: "javac Solution.java && java Solution < input.txt",
        localCmd: (dir: string) => `javac "${path.join(dir, "Solution.java")}" && java -cp "${dir}" Solution < "${path.join(dir, "input.txt")}"`,
      };
  }
}

/**
 * Executes code using Vercel Sandbox microVM.
 */
async function runWithVercelSandbox(
  req: SandboxRunRequest
): Promise<SandboxRunResult> {
  const timeoutMs = req.timeoutMs || 8000;
  const config = getExecutionConfig(req.language);

  // Allocate sandbox with slight buffer beyond execution timeout
  const sandbox = await Sandbox.create({
    timeout: Math.max(timeoutMs + 10000, 20000),
    resources: {
      vcpus: 1,
    },
  });

  const startTime = Date.now();
  try {
    await sandbox.writeFiles([
      { path: config.filename, content: req.code },
      { path: "input.txt", content: req.input ?? "" },
    ]);

    const command = await sandbox.runCommand({
      cmd: "bash",
      args: ["-c", config.runScript],
      timeoutMs,
    });

    const [stdout, stderr] = await Promise.all([
      command.stdout().catch(() => ""),
      command.stderr().catch(() => ""),
    ]);

    const execTimeMs = Date.now() - startTime;
    const exitCode = command.exitCode ?? 0;

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
  // If VERCEL_TOKEN, VERCEL_OIDC_TOKEN, or Vercel production environment is available, use Vercel Sandbox
  const hasVercelEnv = Boolean(
    process.env.VERCEL_TOKEN ||
    process.env.VERCEL_OIDC_TOKEN ||
    process.env.VERCEL_PROJECT_ID ||
    process.env.VERCEL_URL
  );

  try {
    return await runWithVercelSandbox(req);
  } catch (err: any) {
    console.error("[SandboxRunner] Vercel Sandbox error:", err);
    throw new Error(
      "Failed to execute in Vercel Sandbox. Please ensure you have configured your VERCEL_TOKEN and VERCEL_PROJECT_ID correctly. Details: " +
      (err.message || String(err))
    );
  }
}

/**
 * Evaluate single code snippet against expected output.
 */
export async function evaluateCodeSnippet(
  language: string,
  code: string,
  input: string,
  expectedOutput: string,
  submissionId?: string,
  dbDriverCode?: string,
  timeoutMs = 8000
): Promise<SingleTestResult> {
  const startTime = Date.now();
  const lang = normalizeLanguage(language);
  const boilerplate = LANGUAGE_BOILERPLATES[lang];
  const fullCode = dbDriverCode?.includes("{{USER_CODE}}")
    ? dbDriverCode.replace("{{USER_CODE}}", code)
    : boilerplate?.buildFullCode(code) ?? code;

  const result = await runInSandbox({
    language: lang,
    code: fullCode,
    input,
    timeoutMs,
  });

  const execTimeMs = result.execTimeMs || (Date.now() - startTime);

  if (result.timedOut) {
    return {
      actualOutput: "",
      passed: false,
      execTimeMs,
      stderr: "TIME_LIMIT_EXCEEDED: Execution timed out in sandbox",
    };
  }

  if (result.exitCode !== 0 && result.stderr) {
    const isCompile = /SyntaxError|javac|g\+\+|undefined reference/i.test(result.stderr);
    return {
      actualOutput: "",
      passed: false,
      execTimeMs,
      stderr: `${isCompile ? "Compilation Error" : "Runtime Error"}: ${result.stderr}`,
    };
  }

  const actualOutput = result.stdout.trim();
  const passed = !expectedOutput || expectedOutput === "N/A" || !expectedOutput.trim()
    ? true
    : normalizeOutput(actualOutput) === normalizeOutput(expectedOutput);

  return {
    actualOutput,
    passed,
    execTimeMs,
    stdout: result.stdout,
    stderr: result.stderr || undefined,
  };
}

/**
 * Evaluates all test cases for a submission job and persists the verdict in Firestore.
 */
export async function processSubmissionJob(req: ExecutionRequest): Promise<ExecutionResult> {
  const startTime = Date.now();
  console.log(`[SandboxRunner] Processing submission ${req.submissionId} in Vercel Sandbox...`);

  // Update submission status to RUNNING in Firestore
  await adminDb.collection("submissions").doc(req.submissionId).set(
    {
      status: "RUNNING",
      executionEngine: "vercel-sandbox",
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  try {
    const problemRef = adminDb.collection("problems").doc(req.problemId);
    const problemDoc = await problemRef.get();
    if (!problemDoc.exists) throw new Error(`Problem ${req.problemId} not found.`);

    const problemData = problemDoc.data() as any;
    const lang = normalizeLanguage(req.language);
    const dbTemplate = problemData?.templates?.[lang];
    const driverCode: string | undefined = dbTemplate?.driverTemplate ?? dbTemplate?.driverCode;
    const testCasesSnap = await problemRef.collection("testCases").get();
    const testCases = testCasesSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as { input: string; output: string }),
    }));
    const totalTestCases = Math.max(1, testCases.length);
    let passedTestCases = 0;
    let overallStatus: ExecutionResult["status"] = "ACCEPTED";
    let maxExecTime = 0;
    const stdoutLogs: string[] = [];
    const stderrLogs: string[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const evaluation = await evaluateCodeSnippet(
        req.language,
        req.code,
        (testCase.input || "").trim(),
        (testCase.output || "").trim(),
        `${req.submissionId}-tc${i}`,
        driverCode,
        8000
      );

      maxExecTime = Math.max(maxExecTime, evaluation.execTimeMs);
      if (evaluation.stdout) stdoutLogs.push(`[TC ${i + 1}] ${evaluation.stdout}`);

      if (evaluation.stderr) {
        stderrLogs.push(`Test Case ${i + 1} Error: ${evaluation.stderr}`);
        overallStatus = evaluation.stderr.includes("TIME_LIMIT_EXCEEDED")
          ? "TIME_LIMIT_EXCEEDED"
          : /Compilation Error/i.test(evaluation.stderr)
            ? "COMPILATION_ERROR"
            : "RUNTIME_ERROR";
        break;
      }

      if (evaluation.passed) {
        passedTestCases++;
        stdoutLogs.push(`Test Case ${i + 1}: Passed (${evaluation.execTimeMs}ms)`);
      } else {
        overallStatus = "WRONG_ANSWER";
        stderrLogs.push(`Test Case ${i + 1}: Expected "${testCase.output || ""}", Got "${evaluation.actualOutput}"`);
        break;
      }
    }

    const result: ExecutionResult = {
      status: overallStatus,
      execTimeMs: Math.max(maxExecTime, Date.now() - startTime),
      memoryUsedKb: 0,
      totalTestCases,
      passedTestCases,
      stdout: stdoutLogs.join("\n"),
      stderr: stderrLogs.length ? stderrLogs.join("\n") : undefined,
    };

    await adminDb.collection("submissions").doc(req.submissionId).set(
      {
        ...result,
        stderr: result.stderr || null,
        executionEngine: "vercel-sandbox",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return result;
  } catch (err: any) {
    const message = err.message || String(err);
    console.error(`[SandboxRunner] Execution error for ${req.submissionId}:`, err);

    await adminDb.collection("submissions").doc(req.submissionId).set(
      {
        status: "RUNTIME_ERROR",
        stderr: message,
        executionEngine: "vercel-sandbox",
        updatedAt: new Date().toISOString(),
      },
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
