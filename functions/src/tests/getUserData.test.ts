// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import { createTestUser } from "./helpers/auth.js";
import { callFunction } from "./helpers/callFunction.js";
import {
  createUserDoc,
  createObservationDoc,
} from "./helpers/firestore.js";

describe("getUserData", () => {
  it("returns user data with recent step counts", async () => {
    const user = await createTestUser({});

    await createUserDoc(user.uid, { type: "patient" });

    // Create 3 recent observations
    const now = Date.now();
    for (let i = 0; i < 3; i++) {
      const date = new Date(now - i * 86400000); // i days ago
      await createObservationDoc(user.uid, "stepCount", `obs-${i}`, {
        steps: 5000 + i * 1000,
        effectiveDateTime: date.toISOString(),
      });
    }

    // Create 1 old observation (>30 days ago)
    const oldDate = new Date(now - 31 * 86400000);
    await createObservationDoc(user.uid, "stepCount", "obs-old", {
      steps: 1000,
      effectiveDateTime: oldDate.toISOString(),
    });

    const { result, error } = await callFunction(
      "getUserData",
      {},
      user.token,
    );

    expect(error).toBeUndefined();
    const res = result as {
      user: Record<string, unknown>;
      stepCountData: Array<{ id: string; date: string; steps: number }>;
    };

    expect(res.user).toBeDefined();
    // Only recent observations (within 30 days)
    expect(res.stepCountData).toHaveLength(3);
  });

  it("returns observations in descending date order", async () => {
    const user = await createTestUser({});

    await createUserDoc(user.uid, { type: "patient" });

    const now = Date.now();
    const dates = [
      new Date(now - 3 * 86400000), // 3 days ago
      new Date(now - 1 * 86400000), // 1 day ago
      new Date(now - 5 * 86400000), // 5 days ago
    ];

    for (let i = 0; i < dates.length; i++) {
      await createObservationDoc(user.uid, "stepCount", `obs-${i}`, {
        steps: 5000 + i * 1000,
        effectiveDateTime: dates[i].toISOString(),
      });
    }

    const { result } = await callFunction("getUserData", {}, user.token);
    const res = result as {
      stepCountData: Array<{ id: string; date: string; steps: number }>;
    };

    // Verify descending order
    for (let i = 0; i < res.stepCountData.length - 1; i++) {
      expect(
        new Date(res.stepCountData[i].date).getTime(),
      ).toBeGreaterThanOrEqual(
        new Date(res.stepCountData[i + 1].date).getTime(),
      );
    }
  });

  it("rejects unauthenticated requests", async () => {
    const { error } = await callFunction("getUserData", {});
    expect(error).toBeDefined();
    expect(error!.status).toBe("UNAUTHENTICATED");
  });

  it("returns INTERNAL when user doc does not exist", async () => {
    const user = await createTestUser({});
    // Don't create user doc
    const { error } = await callFunction("getUserData", {}, user.token);
    expect(error).toBeDefined();
    expect(error!.status).toBe("INTERNAL");
  });

  it("returns empty stepCountData when no observations exist", async () => {
    const user = await createTestUser({});
    await createUserDoc(user.uid, { type: "patient" });

    const { result } = await callFunction("getUserData", {}, user.token);
    const res = result as {
      user: Record<string, unknown>;
      stepCountData: unknown[];
    };

    expect(res.stepCountData).toHaveLength(0);
  });
});
