import { describe, it, expect } from "vitest";
import {
  createUserDoc,
  getUserMessages,
  waitForCondition,
} from "./helpers/firestore.js";

describe("onUserCreated", () => {
  it("sends welcome message for patient", async () => {
    const userId = `patient-${Date.now()}`;
    await createUserDoc(userId, { type: "patient" });

    await waitForCondition(async () => {
      const messages = await getUserMessages(userId);
      return messages.length > 0;
    });

    const messages = await getUserMessages(userId);
    expect(messages).toHaveLength(1);

    const messageData = messages[0].data();
    expect(messageData.title).toBe("Welcome to Your Health Journey!");
    expect(messageData.type).toBe("info");
    expect(messageData.isDismissed).toBe(false);
  });

  it("sends welcome message for clinician", async () => {
    const userId = `clinician-${Date.now()}`;
    await createUserDoc(userId, { type: "clinician" });

    await waitForCondition(async () => {
      const messages = await getUserMessages(userId);
      return messages.length > 0;
    });

    const messages = await getUserMessages(userId);
    expect(messages).toHaveLength(1);
    expect(messages[0].data().title).toBe("Welcome, Clinician!");
  });

  it("sends welcome message for owner", async () => {
    const userId = `owner-${Date.now()}`;
    await createUserDoc(userId, { type: "owner" });

    await waitForCondition(async () => {
      const messages = await getUserMessages(userId);
      return messages.length > 0;
    });

    const messages = await getUserMessages(userId);
    expect(messages).toHaveLength(1);
    expect(messages[0].data().title).toBe("Welcome, Administrator!");
  });

  it("does not send message for unknown user type", async () => {
    const userId = `unknown-${Date.now()}`;

    // Write a raw doc with unknown type (bypass createUserDoc)
    const admin = await import("firebase-admin");
    await admin.default
      .firestore()
      .collection("users")
      .doc(userId)
      .set({
        type: "unknown",
        disabled: false,
        phoneNumbers: [],
        createdAt: admin.default.firestore.Timestamp.now(),
        lastActiveDate: admin.default.firestore.Timestamp.now(),
      });

    // Wait a reasonable time and verify no messages were created
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const messages = await getUserMessages(userId);
    expect(messages).toHaveLength(0);
  });
});
