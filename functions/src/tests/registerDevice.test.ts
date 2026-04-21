// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import { createTestUser } from "./helpers/auth.js";
import { callFunction } from "./helpers/callFunction.js";
import { getUserDevices } from "./helpers/firestore.js";

describe("registerDevice", () => {
  // Skipped: upstream @stanfordspezi/spezi-firebase-cloud-messaging package
  // writes Device class instances directly to Firestore, which rejects custom
  // prototypes in newer @google-cloud/firestore versions.
  it.skip("registers a device successfully", async () => {
    const user = await createTestUser({});

    const { error } = await callFunction(
      "registerDevice",
      {
        notificationToken: "test-token-123",
        platform: "iOS",
      },
      user.token,
    );

    expect(error).toBeUndefined();

    // Verify device was stored in Firestore
    const devices = await getUserDevices(user.uid);
    expect(devices).toHaveLength(1);

    const deviceData = devices[0].data();
    expect(deviceData.notificationToken).toBe("test-token-123");
    expect(deviceData.platform).toBe("iOS");
  });

  it("rejects unauthenticated requests", async () => {
    const { error } = await callFunction("registerDevice", {
      notificationToken: "test-token",
      platform: "iOS",
    });
    expect(error).toBeDefined();
    expect(error!.status).toBe("UNAUTHENTICATED");
  });

  it("rejects missing required fields", async () => {
    const user = await createTestUser({});
    const { error } = await callFunction("registerDevice", {}, user.token);
    expect(error).toBeDefined();
    expect(error!.status).toBe("INVALID_ARGUMENT");
  });
});
