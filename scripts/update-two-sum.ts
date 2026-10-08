import { config } from "dotenv";
config({ path: ".env.local" });

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

let serviceAccount: any;
const servicePath = path.join(process.cwd(), "service.json");
if (fs.existsSync(servicePath)) {
  serviceAccount = JSON.parse(fs.readFileSync(servicePath, "utf8"));
}

if (!getApps().length) {
  if (serviceAccount) {
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
}

const db = getFirestore();

const twoSumRunner = `// JS Runner: reference solution only
const [nums, target] = inputs.map(x => { try { return JSON.parse(x); } catch { return x; } });
const seen = {};
for (let i = 0; i < nums.length; i++) {
  const complement = target - nums[i];
  if (seen[complement] !== undefined) return JSON.stringify([seen[complement], i]);
  seen[nums[i]] = i;
}
return JSON.stringify([]);`;

const twoSumChecker = [
  "// JS Checker: Compare actual output (from Kubernetes) vs expected output (from JS Runner)",
  "try {",
  "  if (!expectedOutput || expectedOutput.trim() === '') {",
  "    return { passed: true, message: 'No expected output to compare.' };",
  "  }",
  "  function normalize(s) {",
  "    try { return JSON.stringify(JSON.parse(String(s).trim())); }",
  "    catch(e) { return String(s).trim(); }",
  "  }",
  "  var ca = normalize(actualOutput);",
  "  var ce = normalize(expectedOutput);",
  "  var passed = ca === ce;",
  "  return { passed: passed, message: passed ? 'Output matched!' : ('Expected: ' + ce + ', Got: ' + ca) };",
  "} catch(err) {",
  "  return { passed: false, message: 'Checker error: ' + err.message };",
  "}"
].join("\n");

async function main() {
  const snap = await db.collection("problems").where("title", "==", "Two Sum").get();
  if (snap.empty) {
    console.log("Two Sum not found");
    process.exit(0);
  }
  for (const doc of snap.docs) {
    console.log("Updating problem doc:", doc.id);
    await doc.ref.update({
      jsRunner: twoSumRunner,
      jsChecker: twoSumChecker,
    });
  }
  console.log("SUCCESS: Updated jsRunner and jsChecker for Two Sum");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error updating problem:", err);
  process.exit(1);
});
