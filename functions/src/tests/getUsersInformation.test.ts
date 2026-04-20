// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import { createTestUser } from "./helpers/auth.js";
import { callFunction } from "./helpers/callFunction.js";
import { createUserDoc } from "./helpers/firestore.js";

type GetUsersResult = Record<
  string,
  {
    data?: { auth: Record<string, unknown>; user?: Record<string, unknown> };
    error?: { code: string; message: string };
  }
>;

describe("getUsersInformation", () => {
  it("admin queries any user", async () => {
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

    const { result, error } = await callFunction(
      "getUsersInformation",
      { userIds: [target.uid] },
      caller.token,
    );

    expect(error).toBeUndefined();
    const data = result as GetUsersResult;
    expect(data[target.uid]?.data).toBeDefined();
    expect(data[target.uid]?.data?.auth).toBeDefined();
    expect(data[target.uid]?.data?.user).toBeDefined();
  });

  it("owner queries users in own org", async () => {
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

    const { result, error } = await callFunction(
      "getUsersInformation",
      { userIds: [target.uid] },
      caller.token,
    );

    expect(error).toBeUndefined();
    const data = result as GetUsersResult;
    expect(data[target.uid]?.data).toBeDefined();
  });

  it("owner gets permission error for user in other org", async () => {
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

    const { result, error } = await callFunction(
      "getUsersInformation",
      { userIds: [target.uid] },
      caller.token,
    );

    expect(error).toBeUndefined();
    const data = result as GetUsersResult;
    expect(data[target.uid]?.error).toBeDefined();
    expect(data[target.uid]?.error?.code).toBe("permission-denied");
  });

  it("clinician queries users in own org", async () => {
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

    const { result, error } = await callFunction(
      "getUsersInformation",
      { userIds: [target.uid] },
      caller.token,
    );

    expect(error).toBeUndefined();
    const data = result as GetUsersResult;
    expect(data[target.uid]?.data).toBeDefined();
  });

  it("patient can query own info", async () => {
    const caller = await createTestUser({
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(caller.uid, {
      type: "patient",
      organization: "org-1",
    });

    const { result, error } = await callFunction(
      "getUsersInformation",
      { userIds: [caller.uid] },
      caller.token,
    );

    expect(error).toBeUndefined();
    const data = result as GetUsersResult;
    expect(data[caller.uid]?.data).toBeDefined();
  });

  it("patient gets permission error for other users", async () => {
    const caller = await createTestUser({
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(caller.uid, {
      type: "patient",
      organization: "org-1",
    });

    const other = await createTestUser({
      email: "other@example.com",
      customClaims: { type: "patient", organization: "org-1" },
    });
    await createUserDoc(other.uid, {
      type: "patient",
      organization: "org-1",
    });

    const { result, error } = await callFunction(
      "getUsersInformation",
      { userIds: [other.uid] },
      caller.token,
    );

    expect(error).toBeUndefined();
    const data = result as GetUsersResult;
    expect(data[other.uid]?.error).toBeDefined();
    expect(data[other.uid]?.error?.code).toBe("permission-denied");
  });

  it("rejects unauthenticated requests", async () => {
    const { error } = await callFunction("getUsersInformation", {
      userIds: ["some-user"],
    });
    expect(error).toBeDefined();
    expect(error!.status).toBe("UNAUTHENTICATED");
  });
});
