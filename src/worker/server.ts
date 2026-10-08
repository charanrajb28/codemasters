/**
 * Worker HTTP Server
 *
 * Exposes the code execution engine as a lightweight HTTP API.
 * Sits behind AWS API Gateway (HTTP API) + VPC Link — never exposed directly
 * to the public internet.
 *
 * Routes:
 *   GET  /health          → liveness probe for ALB / API Gateway
 *   POST /execute         → run code snippet (single test, used by editor "Run")
 *   POST /submit          → full submission evaluation (all test cases)
 */

import http from "http";
import { processSubmissionJob, evaluateCodeSnippet, ExecutionRequest } from "./execution-worker";

const PORT = parseInt(process.env.WORKER_HTTP_PORT || "3001", 10);

// ── Helpers ──────────────────────────────────────────────────────────────────

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function json(res: http.ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

// ── Secret validation ─────────────────────────────────────────────────────────
// API Gateway is configured to forward the shared secret as a header.
// This prevents anyone who somehow discovers the NLB/VPC-Link endpoint
// from bypassing API Gateway.

const WORKER_SECRET = process.env.WORKER_API_SECRET?.trim();

function isAuthorized(req: http.IncomingMessage): boolean {
  if (!WORKER_SECRET) return true; // secret not configured — allow (dev only)
  const headerVal = req.headers["x-worker-secret"];
  if (!headerVal) return false;
  
  // If multiple headers are sent (e.g. by both Vercel and API Gateway), 
  // Node.js joins them with a comma.
  if (Array.isArray(headerVal)) {
    return headerVal.includes(WORKER_SECRET);
  }
  return headerVal.split(",").map(s => s.trim()).includes(WORKER_SECRET);
}

// ── Request router ────────────────────────────────────────────────────────────

async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  const url = req.url || "/";
  const method = req.method || "GET";

  // ── GET /health ─────────────────────────────────────────────────────────────
  if (method === "GET" && url === "/health") {
    return json(res, 200, { status: "ok", ts: new Date().toISOString() });
  }

  // Auth check on all non-health routes
  if (!isAuthorized(req)) {
    return json(res, 401, { error: "Unauthorized" });
  }

  // ── POST /execute ───────────────────────────────────────────────────────────
  // Used by the Vercel web editor "Run" button (single test case, quick feedback).
  if (method === "POST" && url === "/execute") {
    let body: {
      language: string;
      code: string;
      input?: string;
      expectedOutput?: string;
      submissionId?: string;
      dbDriverCode?: string;
    };

    try {
      body = JSON.parse(await readBody(req));
    } catch {
      return json(res, 400, { error: "Invalid JSON body" });
    }

    if (!body.language || !body.code) {
      return json(res, 400, { error: "Missing required fields: language, code" });
    }

    try {
      const result = await evaluateCodeSnippet(
        body.language,
        body.code,
        body.input || "",
        body.expectedOutput || "",
        body.submissionId,
        body.dbDriverCode,
      );
      return json(res, 200, result);
    } catch (err: any) {
      console.error("[Worker/execute] Error:", err);
      return json(res, 500, { error: err.message || "Internal server error" });
    }
  }

  // ── POST /submit ────────────────────────────────────────────────────────────
  // Used by the Vercel web editor "Submit" button (all test cases evaluated).
  if (method === "POST" && url === "/submit") {
    let body: ExecutionRequest;

    try {
      body = JSON.parse(await readBody(req));
    } catch {
      return json(res, 400, { error: "Invalid JSON body" });
    }

    const { submissionId, problemId, userId, language, code } = body;
    if (!submissionId || !problemId || !userId || !language || !code) {
      return json(res, 400, {
        error: "Missing required fields: submissionId, problemId, userId, language, code",
      });
    }

    try {
      const result = await processSubmissionJob(body);
      return json(res, 200, result);
    } catch (err: any) {
      console.error("[Worker/submit] Error:", err);
      return json(res, 500, { error: err.message || "Internal server error" });
    }
  }

  // ── 404 ─────────────────────────────────────────────────────────────────────
  return json(res, 404, { error: "Not found" });
}

// ── Server startup ────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    console.error("[Worker] Unhandled error:", err);
    json(res, 500, { error: "Internal server error" });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[Worker] HTTP server listening on port ${PORT}`);
  console.log(`[Worker] WORKER_API_SECRET: ${WORKER_SECRET ? "configured ✔" : "NOT SET (open — dev mode)"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[Worker] SIGTERM received — shutting down gracefully...");
  server.close(() => process.exit(0));
});
