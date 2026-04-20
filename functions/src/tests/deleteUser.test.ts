// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import admin from "firebase-admin";
import { describe, it, expect } from "vitest";
import { createTestUser } from "./helpers/auth.js";
import { callFunction } from "./helpers/callFunction.js";
import { createUserDoc } from "./helpers/firestore.js";

describe("deleteUser", () => {
  it("admin deletes any user", async () => {
    const caller = await createTestUser({
      customClaims: { type: "admin" },
    });
    await createUserDoc(caller.uid, { type: "admin" });

    const target = await createTestUser({
      email: "target@example.com",
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(target.uid, {
      type: "patient",
      organization: "org-1",
    });

    const { error } = await callFunction(
      "deleteUser",
      { userId: target.uid },
      caller.token,
    );

    expect(error).toBeUndefined();

    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(target.uid)
      .get();
    expect(userDoc.exists).toBe(false);
  });

  it("owner deletes user", async () => {
    const caller = await createTestUser({
      customClaims: { type: "owner", organization: "org-1" },
    });
    await createUserDoc(caller.uid, { type: "owner", organization: "org-1" });

    const target = await createTestUser({
      email: "patient@example.com",
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(target.uid, {
      type: "patient",
      organization: "org-1",
    });

    const { error } = await callFunction(
      "deleteUser",
      { userId: target.uid },
      caller.token,
    );

    expect(error).toBeUndefined();
  });

  it("clinician deletes user", async () => {
    const caller = await createTestUser({
      customClaims: { type: "clinician", organization: "org-1" },
    });
    await createUserDoc(caller.uid, {
      type: "clinician",
      organization: "org-1",
    });

    const target = await createTestUser({
      email: "patient@example.com",
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(target.uid, {
      type: "patient",
      organization: "org-1",
    });

    const { error } = await callFunction(
      "deleteUser",
      { userId: target.uid },
      caller.token,
    );

    expect(error).toBeUndefined();
  });

  it("owner cannot delete user in different org", async () => {
    const caller = await createTestUser({
      customClaims: { type: "owner", organization: "org-1" },
    });
    await createUserDoc(caller.uid, { type: "owner", organization: "org-1" });

    const target = await createTestUser({
      email: "patient@example.com",
      customClaims: { type: "patient", organization: "org-2" },
    });
    await createUserDoc(target.uid, {
      type: "patient",
      organization: "org-2",
    });

    const { error } = await callFunction(
      "deleteUser",
      { userId: target.uid },
      caller.token,
    );

    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
  });

  it("patient cannot delete users", async () => {
    const caller = await createTestUser({
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(caller.uid, {
      type: "patient",
      organization: "org-1",
    });

    const target = await createTestUser({
      email: "patient2@example.com",
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(target.uid, {
      type: "patient",
      organization: "org-1",
    });

    const { error } = await callFunction(
      "deleteUser",
      { userId: target.uid },
      caller.token,
    );

    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
  });

  it("rejects unauthenticated requests", async () => {
    const { error } = await callFunction("deleteUser", {
      userId: "some-user",
    });
    expect(error).toBeDefined();
    expect(error!.status).toBe("UNAUTHENTICATED");
  });
});
