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
  it("admin creates a user of any type", async () => {
    const caller = await createTestUser({
      customClaims: { type: "admin" },
    });
    await createUserDoc(caller.uid, { type: "admin" });

    const { result, error } = await callFunction(
      "createUser",
      {
        auth: { email: "newuser@example.com", displayName: "New User" },
        user: { type: "owner", organization: "org-1" },
      },
      caller.token,
    );

    expect(error).toBeUndefined();
    const userId = (result as { userId: string }).userId;
    expect(userId).toBeDefined();

    const authUser = await admin.auth().getUser(userId);
    expect(authUser.email).toBe("newuser@example.com");
    expect(authUser.customClaims).toEqual({
      type: "owner",
      organization: "org-1",
    });

    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();
    expect(userDoc.exists).toBe(true);
    expect(userDoc.data()?.type).toBe("owner");
    expect(userDoc.data()?.organization).toBe("org-1");
  });

  it("owner creates patient in own org", async () => {
    const caller = await createTestUser({
      customClaims: { type: "owner", organization: "org-1" },
    });
    await createUserDoc(caller.uid, { type: "owner", organization: "org-1" });

    const { result, error } = await callFunction(
      "createUser",
      {
        auth: { email: "patient@example.com" },
        user: { type: "patient", organization: "org-1" },
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
    expect(userDoc.data()?.type).toBe("patient");
    expect(userDoc.data()?.organization).toBe("org-1");
  });

  it("owner creates clinician in own org", async () => {
    const caller = await createTestUser({
      customClaims: { type: "owner", organization: "org-1" },
    });
    await createUserDoc(caller.uid, { type: "owner", organization: "org-1" });

    const { result, error } = await callFunction(
      "createUser",
      {
        auth: { email: "clinician@example.com" },
        user: { type: "clinician", organization: "org-1" },
      },
      caller.token,
    );

    expect(error).toBeUndefined();
    const userId = (result as { userId: string }).userId;

    const authUser = await admin.auth().getUser(userId);
    expect(authUser.customClaims).toEqual({
      type: "clinician",
      organization: "org-1",
    });
  });

  it("owner creates another owner in own org", async () => {
    const caller = await createTestUser({
      customClaims: { type: "owner", organization: "org-1" },
    });
    await createUserDoc(caller.uid, { type: "owner", organization: "org-1" });

    const { result, error } = await callFunction(
      "createUser",
      {
        auth: { email: "owner2@example.com" },
        user: { type: "owner", organization: "org-1" },
      },
      caller.token,
    );

    expect(error).toBeUndefined();
    expect((result as { userId: string }).userId).toBeDefined();
  });

  it("owner cannot create user in different org", async () => {
    const caller = await createTestUser({
      customClaims: { type: "owner", organization: "org-1" },
    });
    await createUserDoc(caller.uid, { type: "owner", organization: "org-1" });

    const { error } = await callFunction(
      "createUser",
      {
        auth: { email: "patient@example.com" },
        user: { type: "patient", organization: "org-2" },
      },
      caller.token,
    );

    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
  });

  it("clinician creates patient in own org", async () => {
    const caller = await createTestUser({
      customClaims: { type: "clinician", organization: "org-1" },
    });
    await createUserDoc(caller.uid, {
      type: "clinician",
      organization: "org-1",
    });

    const { result, error } = await callFunction(
      "createUser",
      {
        auth: { email: "patient@example.com" },
        user: { type: "patient", organization: "org-1" },
      },
      caller.token,
    );

    expect(error).toBeUndefined();
    expect((result as { userId: string }).userId).toBeDefined();
  });

  it("clinician cannot create clinician", async () => {
    const caller = await createTestUser({
      customClaims: { type: "clinician", organization: "org-1" },
    });
    await createUserDoc(caller.uid, {
      type: "clinician",
      organization: "org-1",
    });

    const { error } = await callFunction(
      "createUser",
      {
        auth: { email: "clinician2@example.com" },
        user: { type: "clinician", organization: "org-1" },
      },
      caller.token,
    );

    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
  });

  it("clinician cannot create user in different org", async () => {
    const caller = await createTestUser({
      customClaims: { type: "clinician", organization: "org-1" },
    });
    await createUserDoc(caller.uid, {
      type: "clinician",
      organization: "org-1",
    });

    const { error } = await callFunction(
      "createUser",
      {
        auth: { email: "patient@example.com" },
        user: { type: "patient", organization: "org-2" },
      },
      caller.token,
    );

    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
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
    const caller = await createTestUser({
      customClaims: { type: "admin" },
    });
    await createUserDoc(caller.uid, { type: "admin" });

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
    const caller = await createTestUser({
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(caller.uid, {
      type: "patient",
      organization: "org-1",
    });

    const { error } = await callFunction(
      "createUser",
      {
        auth: { email: "newuser@example.com", displayName: "New User" },
        user: { type: "patient", organization: "org-1" },
      },
      caller.token,
    );
    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
  });
});
