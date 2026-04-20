// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import { Credential } from "../services/auth/credential.js";
import { UserRole } from "../services/auth/userRole.js";
import { UserType } from "../types/index.js";

const expectHttpsError = (fn: () => void, code: string): void => {
  try {
    fn();
    expect.fail("Expected function to throw");
  } catch (error: unknown) {
    expect((error as { code: string }).code).toBe(code);
  }
};

const expectAsyncHttpsError = async (
  fn: () => Promise<unknown>,
  code: string,
): Promise<void> => {
  try {
    await fn();
    expect.fail("Expected function to throw");
  } catch (error: unknown) {
    expect((error as { code: string }).code).toBe(code);
  }
};

describe("Credential", () => {
  it("throws unauthenticated when auth is undefined", () => {
    expectHttpsError(() => new Credential(undefined), "unauthenticated");
  });

  it("throws unauthenticated when uid is undefined", () => {
    expectHttpsError(
      () => new Credential({ uid: undefined as unknown as string, token: {} }),
      "unauthenticated",
    );
  });

  it("exposes userId and claims", () => {
    const cred = new Credential({
      uid: "user1",
      token: { type: UserType.owner, organization: "org-1" },
    });
    expect(cred.userId).toBe("user1");
    expect(cred.claims.type).toBe(UserType.owner);
    expect(cred.claims.organization).toBe("org-1");
  });

  describe("error helpers", () => {
    it("permissionDeniedError returns correct HttpsError", () => {
      const cred = new Credential({ uid: "user1", token: {} });
      const error = cred.permissionDeniedError();
      expect(error.code).toBe("permission-denied");
      expect(error.message).toBe("User does not have permission.");
    });

    it("disabledError returns correct HttpsError", () => {
      const cred = new Credential({ uid: "user1", token: {} });
      const error = cred.disabledError();
      expect(error.code).toBe("permission-denied");
      expect(error.message).toBe("User is disabled.");
    });
  });

  describe("check", () => {
    it("returns matched UserRole.admin", () => {
      const cred = new Credential({
        uid: "admin1",
        token: { type: UserType.admin },
      });
      const role = cred.check(UserRole.admin);
      expect(role).toBe(UserRole.admin);
    });

    it("returns matched UserRole.owner for correct org", () => {
      const cred = new Credential({
        uid: "owner1",
        token: { type: UserType.owner, organization: "org-1" },
      });
      const ownerRole = UserRole.owner("org-1");
      const role = cred.check(ownerRole);
      expect(role).toBe(ownerRole);
    });

    it("rejects owner of wrong org", () => {
      const cred = new Credential({
        uid: "owner1",
        token: { type: UserType.owner, organization: "org-1" },
      });
      expectHttpsError(
        () => cred.check(UserRole.owner("org-2")),
        "permission-denied",
      );
    });

    it("returns matched UserRole.clinician for correct org", () => {
      const cred = new Credential({
        uid: "clinician1",
        token: { type: UserType.clinician, organization: "org-1" },
      });
      const clinicianRole = UserRole.clinician("org-1");
      const role = cred.check(clinicianRole);
      expect(role).toBe(clinicianRole);
    });

    it("rejects clinician for owner role", () => {
      const cred = new Credential({
        uid: "clinician1",
        token: { type: UserType.clinician, organization: "org-1" },
      });
      expectHttpsError(
        () => cred.check(UserRole.owner("org-1")),
        "permission-denied",
      );
    });

    it("returns matched UserRole.patient for correct org", () => {
      const cred = new Credential({
        uid: "patient1",
        token: { type: UserType.patient, organization: "org-1" },
      });
      const patientRole = UserRole.patient("org-1");
      const role = cred.check(patientRole);
      expect(role).toBe(patientRole);
    });

    it("returns matched UserRole.user for self-access", () => {
      const cred = new Credential({
        uid: "user1",
        token: { type: UserType.patient, organization: "org-1" },
      });
      const userRole = UserRole.user("user1");
      const role = cred.check(userRole);
      expect(role).toBe(userRole);
    });

    it("rejects UserRole.user for different userId", () => {
      const cred = new Credential({
        uid: "user1",
        token: { type: UserType.patient, organization: "org-1" },
      });
      expectHttpsError(
        () => cred.check(UserRole.user("user2")),
        "permission-denied",
      );
    });

    it("returns first matching role when multiple provided", () => {
      const cred = new Credential({
        uid: "clinician1",
        token: { type: UserType.clinician, organization: "org-1" },
      });
      const clinicianRole = UserRole.clinician("org-1");
      const role = cred.check(
        UserRole.admin,
        UserRole.owner("org-1"),
        clinicianRole,
      );
      expect(role).toBe(clinicianRole);
    });

    it("rejects if no role matches", () => {
      const cred = new Credential({
        uid: "patient1",
        token: { type: UserType.patient, organization: "org-1" },
      });
      expectHttpsError(
        () =>
          cred.check(
            UserRole.admin,
            UserRole.owner("org-1"),
            UserRole.clinician("org-1"),
          ),
        "permission-denied",
      );
    });

    it("always rejects disabled user", () => {
      const cred = new Credential({
        uid: "admin1",
        token: { type: UserType.admin, disabled: true },
      });
      expectHttpsError(() => cred.check(UserRole.admin), "permission-denied");
    });

    it("rejects disabled user even for self-access", () => {
      const cred = new Credential({
        uid: "user1",
        token: { type: UserType.patient, disabled: true },
      });
      expectHttpsError(
        () => cred.check(UserRole.user("user1")),
        "permission-denied",
      );
    });
  });

  describe("checkAsync", () => {
    it("returns matched role from first promise", async () => {
      const cred = new Credential({
        uid: "admin1",
        token: { type: UserType.admin },
      });
      const role = await cred.checkAsync(
        () => [UserRole.admin],
        () => [UserRole.owner("org-1")],
      );
      expect(role).toBe(UserRole.admin);
    });

    it("falls through to second promise if first doesn't match", async () => {
      const cred = new Credential({
        uid: "owner1",
        token: { type: UserType.owner, organization: "org-1" },
      });
      const ownerRole = UserRole.owner("org-1");
      const role = await cred.checkAsync(
        () => [UserRole.admin],
        () => [ownerRole],
      );
      expect(role).toBe(ownerRole);
    });

    it("supports async promises", async () => {
      const cred = new Credential({
        uid: "owner1",
        token: { type: UserType.owner, organization: "org-1" },
      });
      const ownerRole = UserRole.owner("org-1");
      const role = await cred.checkAsync(
        () => [UserRole.admin],
        async () => [ownerRole],
      );
      expect(role).toBe(ownerRole);
    });

    it("rejects if no promises produce a matching role", async () => {
      const cred = new Credential({
        uid: "patient1",
        token: { type: UserType.patient, organization: "org-1" },
      });
      await expectAsyncHttpsError(
        () =>
          cred.checkAsync(
            () => [UserRole.admin],
            () => [UserRole.owner("org-1")],
          ),
        "permission-denied",
      );
    });

    it("rejects disabled user", async () => {
      const cred = new Credential({
        uid: "admin1",
        token: { type: UserType.admin, disabled: true },
      });
      await expectAsyncHttpsError(
        () => cred.checkAsync(() => [UserRole.admin]),
        "permission-denied",
      );
    });

    it("does not evaluate later promises if early one matches", async () => {
      const cred = new Credential({
        uid: "admin1",
        token: { type: UserType.admin },
      });
      let secondCalled = false;
      await cred.checkAsync(
        () => [UserRole.admin],
        () => {
          secondCalled = true;
          return [UserRole.owner("org-1")];
        },
      );
      expect(secondCalled).toBe(false);
    });
  });
});
