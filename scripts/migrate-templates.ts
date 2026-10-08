import { adminDb } from "../src/lib/firebase-admin";
import { LANGUAGE_BOILERPLATES, SupportedLanguage } from "../src/lib/language-boilerplate";

async function migrate() {
  console.log("Starting migration: Add templates to all problems...");
  const problemsRef = adminDb.collection("problems");
  const snapshot = await problemsRef.get();

  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.templates) {
      const templates: any = {};
      
      const languages: SupportedLanguage[] = ["python", "cpp", "java", "javascript"];
      
      for (const lang of languages) {
        templates[lang] = {
          starterCode: LANGUAGE_BOILERPLATES[lang].starterCode,
          driverCode: LANGUAGE_BOILERPLATES[lang].driverCode,
        };
      }

      await doc.ref.update({ templates });
      console.log(`Updated problem: ${data.title} (${doc.id})`);
      count++;
    } else {
      console.log(`Skipped problem (already has templates): ${data.title} (${doc.id})`);
    }
  }
  
  console.log(`Migration complete. Updated ${count} problems.`);
}

migrate().catch(console.error);
