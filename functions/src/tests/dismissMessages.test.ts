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
    const user = await createTestUser({});
    await createUserDoc(user.uid, { type: "patient" });

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
    const user = await createTestUser({});
    await createUserDoc(user.uid, { type: "patient" });

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
    expect(messages.every((m) => m.data().isDismissed === true)).toBe(true);
  });

  it("dismisses with didPerformAction: true", async () => {
    const user = await createTestUser({});
    await createUserDoc(user.uid, { type: "patient" });

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
