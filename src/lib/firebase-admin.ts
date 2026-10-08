import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

function getAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  let serviceAccount: any;
  const serviceJsonPath = path.join(process.cwd(), "service.json");

  if (fs.existsSync(serviceJsonPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceJsonPath, "utf8"));
  } else {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing Firebase Admin SDK environment variables. " +
        "Please set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, " +
        "and FIREBASE_ADMIN_PRIVATE_KEY in your .env or create service.json in the project root."
      );
    }
    serviceAccount = { projectId, clientEmail, privateKey };
  }

  const projectId = serviceAccount.project_id || serviceAccount.projectId;

  return initializeApp({
    credential: cert(serviceAccount),
    projectId,
  });
}

export const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

export type { DecodedIdToken };
