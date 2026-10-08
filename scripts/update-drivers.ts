/**
 * Updates all existing Firestore problems to use the new batch-JSON driver templates.
 * Run with: npx tsx --env-file=.env.local scripts/update-drivers.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

const serviceJsonPath = path.join(process.cwd(), "service.json");
const serviceAccount = fs.existsSync(serviceJsonPath)
  ? JSON.parse(fs.readFileSync(serviceJsonPath, "utf8"))
  : {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

const apps = getApps();
const app = apps.length
  ? apps[0]!
  : initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.projectId });

const db = getFirestore(app);

// ─── New Batch-JSON Driver Templates ─────────────────────────────────────────

const PYTHON_DRIVER = `import json, sys, time

# ── [USER CODE START] ──
{{USER_CODE}}
# ── [USER CODE END] ──

def _run_one(args, expected):
    try:
        t0 = time.time()
        result = solve(*args) if isinstance(args, list) else solve(args)
        elapsed = int((time.time() - t0) * 1000)
        actual = json.dumps(result, separators=(",", ":"))
        if not expected:
            return {"passed": True, "actual": actual, "execTimeMs": elapsed}
        try:
            exp_norm = json.dumps(json.loads(expected), separators=(",", ":"))
        except Exception:
            exp_norm = str(expected).strip()
        return {"passed": actual == exp_norm, "actual": actual, "execTimeMs": elapsed}
    except Exception as e:
        return {"passed": False, "actual": "", "error": str(e)}

def main():
    payload = json.loads(sys.stdin.read())
    results = [_run_one(tc["args"], tc.get("expected", "")) for tc in payload["testCases"]]
    print(json.dumps({"results": results}))

if __name__ == "__main__":
    main()
`;

const PYTHON_STARTER = `def solve(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`;

const JS_DRIVER = `
// ── [USER CODE START] ──
{{USER_CODE}}
// ── [USER CODE END] ──

async function main() {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const payload = JSON.parse(Buffer.concat(chunks).toString());
    const results = payload.testCases.map(({ args, expected }) => {
        try {
            const t0 = Date.now();
            const result = solve(...args);
            const elapsed = Date.now() - t0;
            const actual = JSON.stringify(result);
            if (!expected) return { passed: true, actual, execTimeMs: elapsed };
            let expNorm;
            try { expNorm = JSON.stringify(JSON.parse(expected)); } catch { expNorm = String(expected).trim(); }
            return { passed: actual === expNorm, actual, execTimeMs: elapsed };
        } catch (e) {
            return { passed: false, actual: "", error: String(e.message || e) };
        }
    });
    console.log(JSON.stringify({ results }));
}
main().catch(e => { console.error(e.message); process.exit(1); });
`;

const JS_STARTER = `function solve(nums, target) {
    const seen = {};
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (seen[comp] !== undefined) return [seen[comp], i];
        seen[nums[i]] = i;
    }
    return [];
}
`;

async function main() {
  const snap = await db.collection("problems").get();
  console.log(`Found ${snap.size} problems. Updating templates...`);

  for (const doc of snap.docs) {
    const data = doc.data();
    const title = data.title || doc.id;

    const templates = {
      python: {
        starterCode: PYTHON_STARTER,
        driverTemplate: PYTHON_DRIVER,
        driverCode: PYTHON_DRIVER,
      },
      javascript: {
        starterCode: JS_STARTER,
        driverTemplate: JS_DRIVER,
        driverCode: JS_DRIVER,
      },
      // Keep existing cpp/java if set, otherwise skip
      ...(data.templates?.cpp ? { cpp: data.templates.cpp } : {}),
      ...(data.templates?.java ? { java: data.templates.java } : {}),
    };

    await doc.ref.update({ templates });
    console.log(`  ✓ Updated: ${title}`);
  }

  console.log("\n✅ Done! All problems updated with batch-JSON driver templates.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Update failed:", err);
  process.exit(1);
});
