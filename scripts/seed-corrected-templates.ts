import { adminDb } from "../src/lib/firebase-admin";
import {
  LANGUAGE_BOILERPLATES,
  SupportedLanguage,
} from "../src/lib/language-boilerplate";

const languages: SupportedLanguage[] = ["python", "cpp", "java", "javascript"];

async function seedCorrectedTemplates() {
  const snapshot = await adminDb.collection("problems").where("title", "==", "Two Sum").get();

  if (snapshot.empty) {
    throw new Error('Problem "Two Sum" was not found in Firestore.');
  }

  for (const doc of snapshot.docs) {
    const templates = Object.fromEntries(
      languages.map((language) => {
        const boilerplate = LANGUAGE_BOILERPLATES[language];
        const starterCode = boilerplate.starterCode;
        const driverTemplate = boilerplate.buildFullCode("{{USER_CODE}}");
        const driverCode = boilerplate.buildFullCode(starterCode);

        return [language, { starterCode, driverTemplate, driverCode }];
      }),
    );

    await doc.ref.update({ templates });
    console.log(`Seeded corrected templates for ${doc.data().title} (${doc.id})`);
  }
}

seedCorrectedTemplates().catch((error) => {
  console.error("Corrected template seed failed:", error);
  process.exitCode = 1;
});
