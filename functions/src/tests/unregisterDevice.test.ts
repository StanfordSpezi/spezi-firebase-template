// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import { createTestUser } from "./helpers/auth.js";
import { callFunction } from "./helpers/callFunction.js";
import { getUserDevices } from "./helpers/firestore.js";

describe("unregisterDevice", () => {
  // Skipped: upstream @stanfordspezi/spezi-firebase-cloud-messaging package
  // writes Device class instances directly to Firestore, which rejects custom
  // prototypes in newer @google-cloud/firestore versions.
  it.skip("unregisters a device successfully", async () => {
    const user = await createTestUser({});

    // First register a device
    await callFunction(
      "registerDevice",
      {
        notificationToken: "test-token-456",
        platform: "Android",
      },
      user.token,
    );

    // Verify device exists
    let devices = await getUserDevices(user.uid);
    expect(devices).toHaveLength(1);

    // Unregister the device
    const { error } = await callFunction(
      "unregisterDevice",
      {
        notificationToken: "test-token-456",
        platform: "Android",
      },
      user.token,
    );

    expect(error).toBeUndefined();

    // Verify device was removed
    devices = await getUserDevices(user.uid);
    expect(devices).toHaveLength(0);
  });

  it("rejects unauthenticated requests", async () => {
    const { error } = await callFunction("unregisterDevice", {
      notificationToken: "test-token",
      platform: "iOS",
    });
    expect(error).toBeDefined();
    expect(error!.status).toBe("UNAUTHENTICATED");
  });

  it("rejects missing required fields", async () => {
    const user = await createTestUser({});
    const { error } = await callFunction(
      "unregisterDevice",
      {},
      user.token,
    );
    expect(error).toBeDefined();
    expect(error!.status).toBe("INVALID_ARGUMENT");
  });
});
