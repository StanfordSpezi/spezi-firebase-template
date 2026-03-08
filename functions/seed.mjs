// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const usersPath = join(__dirname, "emulator-data", "auth_export", "users.json");
const users = JSON.parse(readFileSync(usersPath, "utf-8"));

const app = initializeApp({ projectId: "spezi-firebase-template" });
const auth = getAuth(app);
const firestore = getFirestore(app);

for (const entry of users) {
  const { auth: authData, user: userData } = entry;

  try {
    await auth.createUser({
      uid: authData.uid,
      email: authData.email,
      password: authData.password,
      displayName: authData.displayName,
    });
    console.log(`Created auth user: ${authData.email}`);
  } catch (error) {
    if (error.code === "auth/uid-already-exists") {
      console.log(`Auth user already exists: ${authData.email}`);
    } else {
      throw error;
    }
  }

  const userDoc = firestore.collection("users").doc(authData.uid);
  const existing = await userDoc.get();
  if (!existing.exists) {
    await userDoc.set(userData);
    console.log(`Created Firestore user doc: ${authData.uid}`);
  } else {
    console.log(`Firestore user doc already exists: ${authData.uid}`);
  }
}

console.log(`Seeding complete: ${users.length} users processed.`);
process.exit(0);
