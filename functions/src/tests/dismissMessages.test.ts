// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import { createTestUser } from "./helpers/auth.js";
import { callFunction } from "./helpers/callFunction.js";
import {
  createUserDoc,
  createMessageDoc,
  getUserMessages,
} from "./helpers/firestore.js";

describe("dismissMessages", () => {
  it("dismisses a single message successfully", async () => {
    const user = await createTestUser({
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(user.uid, { type: "patient", organization: "org-1" });

    const messageId = await createMessageDoc(user.uid, {
      title: "Test Message",
      description: "Test description",
    });

    const { result, error } = await callFunction(
      "dismissMessages",
      { messageIds: [messageId] },
      user.token,
    );

    expect(error).toBeUndefined();
    expect((result as { dismissedCount: number }).dismissedCount).toBe(1);

    const messages = await getUserMessages(user.uid);
    const dismissed = messages.find((m) => m.id === messageId);
    expect(dismissed).toBeDefined();
    expect(dismissed!.data().isDismissed).toBe(true);
    expect(dismissed!.data().completedAt).toBeDefined();
  });

  it("dismisses multiple messages at once", async () => {
    const user = await createTestUser({
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(user.uid, { type: "patient", organization: "org-1" });

    const messageId1 = await createMessageDoc(user.uid, {
      title: "Message 1",
      description: "First message",
    });
    const messageId2 = await createMessageDoc(user.uid, {
      title: "Message 2",
      description: "Second message",
    });

    const { result, error } = await callFunction(
      "dismissMessages",
      { messageIds: [messageId1, messageId2] },
      user.token,
    );

    expect(error).toBeUndefined();
    expect((result as { dismissedCount: number }).dismissedCount).toBe(2);

    const messages = await getUserMessages(user.uid);
    const dismissed1 = messages.find((message) => message.id === messageId1);
    const dismissed2 = messages.find((message) => message.id === messageId2);
    expect(dismissed1).toBeDefined();
    expect(dismissed2).toBeDefined();
    expect(dismissed1!.data().isDismissed).toBe(true);
    expect(dismissed2!.data().isDismissed).toBe(true);
  });

  it("dismisses with didPerformAction: true", async () => {
    const user = await createTestUser({
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(user.uid, { type: "patient", organization: "org-1" });

    const messageId = await createMessageDoc(user.uid, {
      title: "Action Message",
      description: "Do something",
    });

    await callFunction(
      "dismissMessages",
      { messageIds: [messageId], didPerformAction: true },
      user.token,
    );

    const messages = await getUserMessages(user.uid);
    const dismissed = messages.find((m) => m.id === messageId);
    expect(dismissed!.data().didPerformAction).toBe(true);
  });

  it("clinician dismisses messages for patient in same org", async () => {
    const clinician = await createTestUser({
      customClaims: { type: "clinician", organization: "org-1" },
    });
    await createUserDoc(clinician.uid, {
      type: "clinician",
      organization: "org-1",
    });

    const patient = await createTestUser({
      email: "patient@example.com",
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(patient.uid, {
      type: "patient",
      organization: "org-1",
    });

    const messageId = await createMessageDoc(patient.uid, {
      title: "Patient Message",
      description: "Test",
    });

    const { result, error } = await callFunction(
      "dismissMessages",
      { userId: patient.uid, messageIds: [messageId] },
      clinician.token,
    );

    expect(error).toBeUndefined();
    expect((result as { dismissedCount: number }).dismissedCount).toBe(1);
  });

  it("clinician cannot dismiss messages for patient in different org", async () => {
    const clinician = await createTestUser({
      customClaims: { type: "clinician", organization: "org-1" },
    });
    await createUserDoc(clinician.uid, {
      type: "clinician",
      organization: "org-1",
    });

    const patient = await createTestUser({
      email: "patient@example.com",
      customClaims: { type: "patient", organization: "org-2" },
    });
    await createUserDoc(patient.uid, {
      type: "patient",
      organization: "org-2",
    });

    const messageId = await createMessageDoc(patient.uid, {
      title: "Patient Message",
      description: "Test",
    });

    const { error } = await callFunction(
      "dismissMessages",
      { userId: patient.uid, messageIds: [messageId] },
      clinician.token,
    );

    expect(error).toBeDefined();
    expect(error!.status).toBe("PERMISSION_DENIED");
  });

  it("admin dismisses messages for any user", async () => {
    const adminUser = await createTestUser({
      customClaims: { type: "admin" },
    });
    await createUserDoc(adminUser.uid, { type: "admin" });

    const patient = await createTestUser({
      email: "patient@example.com",
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(patient.uid, {
      type: "patient",
      organization: "org-1",
    });

    const messageId = await createMessageDoc(patient.uid, {
      title: "Patient Message",
      description: "Test",
    });

    const { result, error } = await callFunction(
      "dismissMessages",
      { userId: patient.uid, messageIds: [messageId] },
      adminUser.token,
    );

    expect(error).toBeUndefined();
    expect((result as { dismissedCount: number }).dismissedCount).toBe(1);
  });

  it("rejects unauthenticated requests", async () => {
    const { error } = await callFunction("dismissMessages", {
      messageIds: ["some-id"],
    });
    expect(error).toBeDefined();
    expect(error!.status).toBe("UNAUTHENTICATED");
  });

  it("rejects missing messageIds", async () => {
    const user = await createTestUser({});
    const { error } = await callFunction("dismissMessages", {}, user.token);
    expect(error).toBeDefined();
    expect(error!.status).toBe("INVALID_ARGUMENT");
  });
});
