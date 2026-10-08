/**
 * Firestore Seed Script
 * Creates admin user, student user, and a sample DSA problem.
 *
 * Usage:
 *   npx ts-node --esm scripts/seed-firestore.ts
 *   OR (with ts-node already installed):
 *   node --loader ts-node/register/transpile-only scripts/seed-firestore.ts
 *
 * Prerequisites:
 *   - FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY set in .env.local
 *   - firebase-admin installed
 */

// Load env vars
import { config } from "dotenv";
config({ path: ".env.local" });

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

let serviceAccount: any;

const serviceJsonPath = path.join(process.cwd(), "service.json");
if (fs.existsSync(serviceJsonPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(serviceJsonPath, "utf8"));
} else {
  serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
}

const apps = getApps();
const app = apps.length
  ? apps[0]!
  : initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId || serviceAccount.project_id,
    });

const adminAuth = getAuth(app);
const db = getFirestore(app);

async function createOrGetUser(email: string, password: string, name: string, role: "ADMIN" | "STUDENT") {
  try {
    const existing = await adminAuth.getUserByEmail(email);
    console.log(`  ✓ User exists: ${email} (uid: ${existing.uid})`);

    await db.collection("users").doc(existing.uid).set(
      { name, email, role, isSuspended: false, createdAt: new Date().toISOString() },
      { merge: true }
    );
    await adminAuth.setCustomUserClaims(existing.uid, { role });
    return existing.uid;
  } catch {
    // User doesn't exist — create
    const user = await adminAuth.createUser({ email, password, displayName: name });
    await db.collection("users").doc(user.uid).set({
      name,
      email,
      role,
      isSuspended: false,
      createdAt: new Date().toISOString(),
    });
    await adminAuth.setCustomUserClaims(user.uid, { role });
    console.log(`  ✓ Created user: ${email} (uid: ${user.uid})`);
    return user.uid;
  }
}

async function main() {
  console.log("🌱 Seeding Firestore...\n");

  // Create users
  console.log("Users:");
  await createOrGetUser("admin@dsa.local", "admin123", "Admin User", "ADMIN");
  await createOrGetUser("student@dsa.local", "student123", "Student User", "STUDENT");

  // Create sample problem
  console.log("\nProblems:");
  const slug = "two-sum-" + Date.now().toString().slice(-4);
  const snap = await db.collection("problems").where("slug", ">=", "two-sum-").limit(1).get();

  if (!snap.empty) {
    console.log("  ✓ Sample problem already exists: Two Sum");
  } else {
    const now = new Date().toISOString();
    const problemRef = db.collection("problems").doc();
    await problemRef.set({
      title: "Two Sum",
      slug,
      description: `## Two Sum\n\nGiven an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\n### Example 1\n\`\`\`\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\`\`\`\n\n### Constraints\n- \`2 <= nums.length <= 10^4\`\n- \`-10^9 <= nums[i] <= 10^9\`\n- Only one valid answer exists.`,
      difficulty: "Easy",
      timeLimit: 2000,
      memoryLimit: 256,
      tags: ["Array", "Hash Table"],
      createdAt: now,
      updatedAt: now,
    });

    const testCases = [
      { input: "[2,7,11,15]\n9", output: "[0,1]", isHidden: false },
      { input: "[3,2,4]\n6", output: "[1,2]", isHidden: false },
      { input: "[3,3]\n6", output: "[0,1]", isHidden: true },
    ];

    const batch = db.batch();
    for (const tc of testCases) {
      batch.set(problemRef.collection("testCases").doc(), tc);
    }
    await batch.commit();
    console.log(`  ✓ Created problem: Two Sum (id: ${problemRef.id})`);
  }

  console.log("\n✅ Seed complete!\n");
  console.log("Login credentials:");
  console.log("  Admin:   admin@dsa.local   / admin123");
  console.log("  Student: student@dsa.local / student123");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
