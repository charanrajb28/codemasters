import { adminDb } from "../src/lib/firebase-admin";

async function main() {
  const problems = await adminDb.collection("problems").get();
  for (const p of problems.docs) {
    console.log("Problem:", p.id, p.data().title);
    const tcs = await adminDb.collection("problems").doc(p.id).collection("testCases").get();
    for (const tc of tcs.docs) {
      console.log("  TC:", tc.id, JSON.stringify(tc.data()));
    }
    const templates = p.data().templates;
    console.log("  Python Template DriverCode:", templates?.python?.driverCode || templates?.python?.driverTemplate);
  }
}
main().catch(console.error);
