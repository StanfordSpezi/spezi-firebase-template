// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import admin from "firebase-admin";
import { describe, it, expect } from "vitest";
import { createTestUser } from "./helpers/auth.js";
import { callFunction } from "./helpers/callFunction.js";
import { createUserDoc } from "./helpers/firestore.js";

describe("createUser", () => {
  it("creates a user successfully", async () => {
    const caller = await createTestUser({ customClaims: { type: "owner" } });
    await createUserDoc(caller.uid, { type: "owner" });

    const { result, error } = await callFunction(
      "createUser",
      {
        auth: { email: "newuser@example.com", displayName: "New User" },
        user: { type: "patient" },
      },
      caller.token,
    );

    expect(error).toBeUndefined();
    const userId = (result as { userId: string }).userId;
    expect(userId).toBeDefined();

    // Verify Firebase Auth user was created
    const authUser = await admin.auth().getUser(userId);
    expect(authUser.email).toBe("newuser@example.com");
    expect(authUser.displayName).toBe("New User");

    // Verify Firestore document was created
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();
    expect(userDoc.exists).toBe(true);
    expect(userDoc.data()?.type).toBe("patient");
    expect(userDoc.data()?.disabled).toBe(false);
  });

  it("creates a user with organization and clinician", async () => {
    const caller = await createTestUser({ customClaims: { type: "owner" } });
    await createUserDoc(caller.uid, { type: "owner" });

    const { result, error } = await callFunction(
      "createUser",
      {
        auth: { email: "patient@example.com" },
        user: {
          type: "patient",
          organization: "org-123",
          clinician: caller.uid,
        },
      },
      caller.token,
    );

    expect(error).toBeUndefined();
    const userId = (result as { userId: string }).userId;

    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();
    expect(userDoc.data()?.organization).toBe("org-123");
    expect(userDoc.data()?.clinician).toBe(caller.uid);
  });

  it("rejects unauthenticated requests", async () => {
    const { error } = await callFunction("createUser", {
      auth: { email: "test@example.com" },
      user: { type: "patient" },
    });
    expect(error).toBeDefined();
    expect(error!.status).toBe("UNAUTHENTICATED");
  });

  it("rejects invalid email", async () => {
    const caller = await createTestUser({ customClaims: { type: "owner" } });
    await createUserDoc(caller.uid, { type: "owner" });

    const { error } = await callFunction(
      "createUser",
      {
        auth: { email: "not-an-email" },
        user: { type: "patient" },
      },
      caller.token,
    );
    expect(error).toBeDefined();
    expect(error!.status).toBe("INVALID_ARGUMENT");
  });

  it("rejects patient claims", async () => {
    const caller = await createTestUser({ customClaims: { type: "patient" } });
    await createUserDoc(caller.uid, { type: "patient" });

    const { error } = await callFunction(
      "createUser",
      {
        auth: { email: "newuser@example.com", displayName: "New User" },
        user: { type: "patient" },
      },
      caller.token,
    );
    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
  });
});
