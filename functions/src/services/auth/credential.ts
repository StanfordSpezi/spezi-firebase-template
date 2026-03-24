// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { HttpsError } from "firebase-functions/v2/https";
import { type UserRole } from "./userRole.js";
import { type CustomClaims } from "../../types/index.js";

type UserRoleWithFalsy = UserRole | null | undefined;

export class Credential {
  readonly userId: string;
  readonly claims: CustomClaims;

  constructor(authData: { uid: string; token?: CustomClaims } | undefined) {
    if (authData?.uid === undefined) {
      throw new HttpsError("unauthenticated", "User is not authenticated.");
    }
    this.userId = authData.uid;
    this.claims = authData.token ?? {};
  }

  check(...roles: UserRoleWithFalsy[]): UserRole {
    if (this.claims.disabled === true) {
      throw this.disabledError();
    }

    const role = roles.find((role) => role?.matches(this.claims, this.userId));
    if (role !== undefined && role !== null) return role;
    throw this.permissionDeniedError();
  }

  async checkAsync(
    ...promises: Array<() => Promise<UserRoleWithFalsy[]> | UserRoleWithFalsy[]>
  ): Promise<UserRole> {
    if (this.claims.disabled === true) {
      throw this.disabledError();
    }

    for (const promise of promises) {
      const roles = await promise();
      const role = roles.find((role) =>
        role?.matches(this.claims, this.userId),
      );
      if (role !== undefined && role !== null) return role;
    }
    throw this.permissionDeniedError();
  }

  permissionDeniedError() {
    return new HttpsError(
      "permission-denied",
      "User does not have permission.",
    );
  }

  disabledError() {
    return new HttpsError("permission-denied", "User is disabled.");
  }
}
