import { adminDb } from "../src/lib/firebase-admin";
import { LANGUAGE_BOILERPLATES } from "../src/lib/language-boilerplate";

/**
 * Replace the Python template stored in every problem document.
 *
 * This intentionally updates only templates.python so the C++, Java, and
 * JavaScript templates already stored on each problem are preserved.
 */
async function updatePythonTemplates() {
  const snapshot = await adminDb.collection("problems").get();
  const pythonTemplate = {
    starterCode: LANGUAGE_BOILERPLATES.python.starterCode,
    driverTemplate: LANGUAGE_BOILERPLATES.python.driverCode,
    driverCode: LANGUAGE_BOILERPLATES.python.driverCode.replace(
      "{{USER_CODE}}",
      LANGUAGE_BOILERPLATES.python.starterCode,
    ),
  };

  let updated = 0;

  for (const doc of snapshot.docs) {
    await doc.ref.update({ "templates.python": pythonTemplate });
    console.log(`Updated Python template: ${doc.data().title ?? doc.id}`);
    updated += 1;
  }

  console.log(`Python template migration complete. Updated ${updated} problems.`);
}

updatePythonTemplates().catch((error) => {
  console.error("Python template migration failed:", error);
  process.exitCode = 1;
});
