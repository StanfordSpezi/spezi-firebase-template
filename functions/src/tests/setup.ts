// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

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
