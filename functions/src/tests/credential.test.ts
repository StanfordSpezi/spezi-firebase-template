// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import { Credential } from "../services/auth/credential.js";
import { UserType } from "../types/index.js";

function expectHttpsError(fn: () => void, code: string): void {
  try {
    fn();
    expect.fail("Expected function to throw");
  } catch (error: unknown) {
    expect((error as { code: string }).code).toBe(code);
  }
}

describe("Credential", () => {
  it("throws unauthenticated when auth is undefined", () => {
    expectHttpsError(() => new Credential(undefined), "unauthenticated");
  });

  it("throws unauthenticated when uid is undefined", () => {
    expectHttpsError(
      () =>
        new Credential({ uid: undefined as unknown as string, token: {} }),
      "unauthenticated",
    );
  });

  describe("checkAuthenticated", () => {
    it("passes for valid user", () => {
      const cred = new Credential({ uid: "user1", token: {} });
      expect(() => cred.checkAuthenticated()).not.toThrow();
    });

    it("throws permission-denied for disabled user", () => {
      const cred = new Credential({
        uid: "user1",
        token: { disabled: true },
      });
      expectHttpsError(() => cred.checkAuthenticated(), "permission-denied");
    });
  });

  describe("checkOwnerOrClinician", () => {
    it("passes for owner", () => {
      const cred = new Credential({
        uid: "user1",
        token: { type: UserType.owner },
      });
      expect(() => cred.checkOwnerOrClinician()).not.toThrow();
    });

    it("passes for clinician", () => {
      const cred = new Credential({
        uid: "user1",
        token: { type: UserType.clinician },
      });
      expect(() => cred.checkOwnerOrClinician()).not.toThrow();
    });

    it("throws permission-denied for patient", () => {
      const cred = new Credential({
        uid: "user1",
        token: { type: UserType.patient },
      });
      expectHttpsError(
        () => cred.checkOwnerOrClinician(),
        "permission-denied",
      );
    });

    it("throws permission-denied for disabled owner", () => {
      const cred = new Credential({
        uid: "user1",
        token: { type: UserType.owner, disabled: true },
      });
      expectHttpsError(
        () => cred.checkOwnerOrClinician(),
        "permission-denied",
      );
    });
  });

  describe("checkSelfOrOwnerOrClinician", () => {
    it("passes for self-access regardless of type", () => {
      const cred = new Credential({
        uid: "user1",
        token: { type: UserType.patient },
      });
      expect(() => cred.checkSelfOrOwnerOrClinician("user1")).not.toThrow();
    });

    it("passes for clinician accessing other user", () => {
      const cred = new Credential({
        uid: "clinician1",
        token: { type: UserType.clinician },
      });
      expect(() =>
        cred.checkSelfOrOwnerOrClinician("patient1"),
      ).not.toThrow();
    });

    it("passes for owner accessing other user", () => {
      const cred = new Credential({
        uid: "owner1",
        token: { type: UserType.owner },
      });
      expect(() =>
        cred.checkSelfOrOwnerOrClinician("patient1"),
      ).not.toThrow();
    });

    it("throws permission-denied for patient accessing other user", () => {
      const cred = new Credential({
        uid: "patient1",
        token: { type: UserType.patient },
      });
      expectHttpsError(
        () => cred.checkSelfOrOwnerOrClinician("patient2"),
        "permission-denied",
      );
    });

    it("throws permission-denied for disabled user", () => {
      const cred = new Credential({
        uid: "user1",
        token: { type: UserType.owner, disabled: true },
      });
      expectHttpsError(
        () => cred.checkSelfOrOwnerOrClinician("user1"),
        "permission-denied",
      );
    });
  });
});
