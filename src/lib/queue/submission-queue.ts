import { adminDb } from "@/lib/firebase-admin";

export interface SubmissionJob {
  submissionId: string;
  problemId: string;
  userId: string;
  language: string;
  code: string;
  createdAt: string;
}

/**
 * Pushes a new submission job to the asynchronous execution queue.
 */
export async function pushSubmissionJob(job: SubmissionJob): Promise<boolean> {
  try {
    // 1. Mark status in Firestore as QUEUED
    await adminDb.collection("submissions").doc(job.submissionId).set(
      {
        status: "QUEUED",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`[SubmissionQueue] Job queued successfully: ${job.submissionId}`);
    return true;
  } catch (err) {
    console.error("[SubmissionQueue] Error queuing job:", err);
    return false;
  }
}
