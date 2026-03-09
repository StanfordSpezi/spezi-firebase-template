import { describe, it, expect } from "vitest";
import { createTestUser } from "./helpers/auth.js";
import { callFunction } from "./helpers/callFunction.js";
import {
  createUserDoc,
  createMessageDoc,
  getUserMessages,
} from "./helpers/firestore.js";

describe("dismissMessage", () => {
  it("dismisses a message successfully", async () => {
    const user = await createTestUser({});
    await createUserDoc(user.uid, { type: "patient" });

    const messageId = await createMessageDoc(user.uid, {
      title: "Test Message",
      description: "Test description",
    });

    const { result, error } = await callFunction(
      "dismissMessage",
      { messageId },
      user.token,
    );

    expect(error).toBeUndefined();
    expect((result as { success: boolean }).success).toBe(true);

    // Verify the message was updated in Firestore
    const messages = await getUserMessages(user.uid);
    const dismissed = messages.find((m) => m.id === messageId);
    expect(dismissed).toBeDefined();
    expect(dismissed!.data().isDismissed).toBe(true);
    expect(dismissed!.data().completedAt).toBeDefined();
  });

  it("dismisses with didPerformAction: true", async () => {
    const user = await createTestUser({});
    await createUserDoc(user.uid, { type: "patient" });

    const messageId = await createMessageDoc(user.uid, {
      title: "Action Message",
      description: "Do something",
    });

    await callFunction(
      "dismissMessage",
      { messageId, didPerformAction: true },
      user.token,
    );

    const messages = await getUserMessages(user.uid);
    const dismissed = messages.find((m) => m.id === messageId);
    expect(dismissed!.data().didPerformAction).toBe(true);
  });

  it("rejects unauthenticated requests", async () => {
    const { error } = await callFunction("dismissMessage", {
      messageId: "some-id",
    });
    expect(error).toBeDefined();
    expect(error!.status).toBe("UNAUTHENTICATED");
  });

  it("rejects empty messageId", async () => {
    const user = await createTestUser({});
    const { error } = await callFunction(
      "dismissMessage",
      { messageId: "" },
      user.token,
    );
    expect(error).toBeDefined();
    expect(error!.status).toBe("INVALID_ARGUMENT");
  });

  it("rejects missing messageId", async () => {
    const user = await createTestUser({});
    const { error } = await callFunction("dismissMessage", {}, user.token);
    expect(error).toBeDefined();
    expect(error!.status).toBe("INVALID_ARGUMENT");
  });
});
