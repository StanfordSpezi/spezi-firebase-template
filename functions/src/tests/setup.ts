import admin from "firebase-admin";
import { beforeEach } from "vitest";
import { clearFirestore, deleteAllAuthUsers } from "./helpers/firestore.js";

if (!admin.apps.length) {
  admin.initializeApp({ projectId: "spezi-firebase-template" });
}

beforeEach(async () => {
  await clearFirestore();
  await deleteAllAuthUsers();
});
