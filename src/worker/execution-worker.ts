"use server";

/**
 * Execution worker: powered by Vercel Sandbox microVMs with local fallback.
 */

export {
  evaluateCodeSnippet,
  processSubmissionJob,
  runInSandbox,
  type ExecutionRequest,
  type ExecutionResult,
  type SingleTestResult,
} from "@/lib/sandbox-runner";
