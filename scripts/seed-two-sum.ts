import { adminDb } from "../src/lib/firebase-admin";
import { LANGUAGE_BOILERPLATES, SupportedLanguage } from "../src/lib/language-boilerplate";

const languages: SupportedLanguage[] = ["python", "cpp", "java", "javascript"];

const templates = Object.fromEntries(
  languages.map((language) => {
    const boilerplate = LANGUAGE_BOILERPLATES[language];
    return [language, {
      starterCode: boilerplate.starterCode,
      driverTemplate: boilerplate.buildFullCode("{{USER_CODE}}"),
      driverCode: boilerplate.buildFullCode(boilerplate.starterCode),
    }];
  }),
);

async function seedTwoSum() {
  console.log("Seeding Two Sum problem into Firestore...");
  try {
    const snap = await adminDb
      .collection("problems")
      .where("title", "==", "Two Sum")
      .get();

    let docRef: FirebaseFirestore.DocumentReference;
    if (snap.empty) {
      docRef = adminDb.collection("problems").doc();
    } else {
      docRef = snap.docs[0].ref;
    }

    const now = new Date().toISOString();
    const problemData = {
      title: "Two Sum",
      slug: "two-sum",
      difficulty: "Easy",
      timeLimit: 2000,
      memoryLimit: 256,
      tags: ["Array", "Hash Table"],
      paramCount: 2,
      paramNames: ["nums", "target"],
      description: `## Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

### Example 1
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

### Constraints
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- Only one valid answer exists.`,
      jsRunner: `// JS Runner: reference solution only
const [nums, target] = inputs.map(x => { try { return JSON.parse(x); } catch { return x; } });
const seen = {};
for (let i = 0; i < nums.length; i++) {
  const complement = target - nums[i];
  if (seen[complement] !== undefined) return JSON.stringify([seen[complement], i]);
  seen[nums[i]] = i;
}
return JSON.stringify([]);`,
      jsChecker: `// JS Checker Code
try {
  if (!expectedOutput || expectedOutput.trim() === "" || expectedOutput === "N/A") {
    return { passed: true, message: "Executed custom test case successfully." };
  }
  const cleanActual = String(actualOutput).trim();
  const cleanExpected = String(expectedOutput).trim();
  const passed = cleanActual === cleanExpected;
  return {
    passed,
    message: passed ? "Output matched expected result!" : \`Output mismatch. Expected: \${cleanExpected}, Got: \${cleanActual}\`
  };
} catch (err) {
  return { passed: false, message: "Checker evaluation error: " + err.message };
}`,
      templates,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(problemData, { merge: true });

    // Delete existing test cases
    const existingTCs = await docRef.collection("testCases").get();
    const deleteBatch = adminDb.batch();
    existingTCs.docs.forEach((doc) => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();

    // Add new test cases
    const addBatch = adminDb.batch();

    // Test Case 1
    const tc1 = docRef.collection("testCases").doc();
    addBatch.set(tc1, {
      input: "[3,2,4]\n6",
      output: "[1,2]",
      isHidden: false,
    });

    // Test Case 2
    const tc2 = docRef.collection("testCases").doc();
    addBatch.set(tc2, {
      input: "[2,7,11,15]\n9",
      output: "[0,1]",
      isHidden: false,
    });

    // Test Case 3 (Hidden)
    const tc3 = docRef.collection("testCases").doc();
    addBatch.set(tc3, {
      input: "[3,3]\n6",
      output: "[0,1]",
      isHidden: true,
    });

    await addBatch.commit();
    console.log("Successfully seeded Two Sum problem and 3 test cases into Firestore! Problem ID:", docRef.id);
  } catch (err) {
    console.error("Error seeding Two Sum:", err);
  }
}

seedTwoSum();
