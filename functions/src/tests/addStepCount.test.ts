// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import { createTestUser } from "./helpers/auth.js";
import { callFunction } from "./helpers/callFunction.js";
import { getUserObservations } from "./helpers/firestore.js";

describe("addStepCount", () => {
  it("adds a valid step count observation", async () => {
    const user = await createTestUser({});
    const date = new Date().toISOString();

    const { result, error } = await callFunction(
      "addStepCount",
      { date, steps: 5000 },
      user.token,
    );

    expect(error).toBeUndefined();
    const res = result as { success: boolean; observationId: string };
    expect(res.success).toBe(true);
    expect(res.observationId).toBeDefined();

    // Verify the observation was stored in Firestore
    const observations = await getUserObservations(user.uid, "stepCount");
    expect(observations).toHaveLength(1);

    const storedData = observations[0].data();
    expect(storedData.resourceType).toBe("Observation");
    expect(storedData.code.coding[0].code).toBe("55423-8");
    expect(storedData.valueQuantity.value).toBe(5000);
    expect(storedData.valueQuantity.unit).toBe("steps");
    expect(storedData.effectiveDateTime).toBe(
      new Date(date).toISOString(),
    );
  });

  it("creates deterministic observation IDs based on user and date", async () => {
    const user = await createTestUser({});
    const date = new Date().toISOString();

    // Call twice with the same date
    await callFunction("addStepCount", { date, steps: 5000 }, user.token);
    await callFunction("addStepCount", { date, steps: 8000 }, user.token);

    // Should have only one document (set, not add)
    const observations = await getUserObservations(user.uid, "stepCount");
    expect(observations).toHaveLength(1);
    expect(observations[0].data().valueQuantity.value).toBe(8000);
  });

  it("rejects unauthenticated requests", async () => {
    const date = new Date().toISOString();
    const { error } = await callFunction("addStepCount", {
      date,
      steps: 5000,
    });
    expect(error).toBeDefined();
    expect(error!.status).toBe("UNAUTHENTICATED");
  });

  it("rejects negative step counts", async () => {
    const user = await createTestUser({});
    const { error } = await callFunction(
      "addStepCount",
      { date: new Date().toISOString(), steps: -1 },
      user.token,
    );
    expect(error).toBeDefined();
    expect(error!.status).toBe("INVALID_ARGUMENT");
  });

  it("rejects step counts over 100000", async () => {
    const user = await createTestUser({});
    const { error } = await callFunction(
      "addStepCount",
      { date: new Date().toISOString(), steps: 100001 },
      user.token,
    );
    expect(error).toBeDefined();
    expect(error!.status).toBe("INVALID_ARGUMENT");
  });

  it("rejects invalid date format", async () => {
    const user = await createTestUser({});
    const { error } = await callFunction(
      "addStepCount",
      { date: "not-a-date", steps: 5000 },
      user.token,
    );
    expect(error).toBeDefined();
    expect(error!.status).toBe("INVALID_ARGUMENT");
  });

  it("rejects missing fields", async () => {
    const user = await createTestUser({});
    const { error } = await callFunction("addStepCount", {}, user.token);
    expect(error).toBeDefined();
    expect(error!.status).toBe("INVALID_ARGUMENT");
  });
});
