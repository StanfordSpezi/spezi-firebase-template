// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import admin from "firebase-admin";
import { describe, it, expect } from "vitest";
import { createTestUser } from "./helpers/auth.js";
import { callFunction } from "./helpers/callFunction.js";
import { createUserDoc } from "./helpers/firestore.js";

describe("updateUserInformation", () => {
  it("self-access updates non-security fields", async () => {
    const user = await createTestUser({
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(user.uid, { type: "patient", organization: "org-1" });

    const { error } = await callFunction(
      "updateUserInformation",
      {
        userId: user.uid,
        data: {
          user: { displayName: "Updated Name", language: "de" },
        },
      },
      user.token,
    );

    expect(error).toBeUndefined();

    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get();
    expect(userDoc.data()?.displayName).toBe("Updated Name");
    expect(userDoc.data()?.language).toBe("de");
  });

  it("self-access cannot change own type", async () => {
    const user = await createTestUser({
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(user.uid, { type: "patient", organization: "org-1" });

    const { error } = await callFunction(
      "updateUserInformation",
      {
        userId: user.uid,
        data: { user: { type: "owner" } },
      },
      user.token,
    );

    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
  });

  it("self-access cannot change own organization", async () => {
    const user = await createTestUser({
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(user.uid, { type: "patient", organization: "org-1" });

    const { error } = await callFunction(
      "updateUserInformation",
      {
        userId: user.uid,
        data: { user: { organization: "org-2" } },
      },
      user.token,
    );

    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
  });

  it("admin updates any user", async () => {
    const caller = await createTestUser({
      customClaims: { type: "admin" },
    });
    await createUserDoc(caller.uid, { type: "admin" });

    const target = await createTestUser({
      email: "patient@example.com",
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(target.uid, {
      type: "patient",
      organization: "org-1",
    });

    const { error } = await callFunction(
      "updateUserInformation",
      {
        userId: target.uid,
        data: { user: { displayName: "Admin Updated" } },
      },
      caller.token,
    );

    expect(error).toBeUndefined();
  });

  it("owner updates user in own org", async () => {
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
      "updateUserInformation",
      {
        userId: target.uid,
        data: { user: { displayName: "Owner Updated" } },
      },
      caller.token,
    );

    expect(error).toBeUndefined();
  });

  it("owner cannot update user in different org", async () => {
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
      "updateUserInformation",
      {
        userId: target.uid,
        data: { user: { displayName: "Should Fail" } },
      },
      caller.token,
    );

    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
  });

  it("clinician updates patient in own org", async () => {
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
      "updateUserInformation",
      {
        userId: target.uid,
        data: { user: { displayName: "Clinician Updated" } },
      },
      caller.token,
    );

    expect(error).toBeUndefined();
  });

  it("clinician cannot change patient security fields", async () => {
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
      "updateUserInformation",
      {
        userId: target.uid,
        data: { user: { type: "clinician" } },
      },
      caller.token,
    );

    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
  });

  it("clinician cannot update another clinician", async () => {
    const caller = await createTestUser({
      customClaims: { type: "clinician", organization: "org-1" },
    });
    await createUserDoc(caller.uid, {
      type: "clinician",
      organization: "org-1",
    });

    const target = await createTestUser({
      email: "clinician2@example.com",
      customClaims: { type: "clinician", organization: "org-1" },
    });
    await createUserDoc(target.uid, {
      type: "clinician",
      organization: "org-1",
    });

    const { error } = await callFunction(
      "updateUserInformation",
      {
        userId: target.uid,
        data: { user: { displayName: "Should Fail" } },
      },
      caller.token,
    );

    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
  });

  it("patient cannot update other users", async () => {
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
      "updateUserInformation",
      {
        userId: target.uid,
        data: { user: { displayName: "Should Fail" } },
      },
      caller.token,
    );

    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
  });

  it("rejects unauthenticated requests", async () => {
    const { error } = await callFunction("updateUserInformation", {
      userId: "some-user",
      data: { user: { displayName: "test" } },
    });
    expect(error).toBeDefined();
    expect(error!.status).toBe("UNAUTHENTICATED");
  });
});
