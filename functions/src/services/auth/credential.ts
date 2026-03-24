// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { HttpsError } from "firebase-functions/v2/https";
import { UserType } from "../../types/index.js";

interface CustomClaims {
  type?: string;
  disabled?: boolean;
  [key: string]: unknown;
}

// TODO: Add support for organization permissions
export class Credential {
  readonly userId: string;
  private readonly claims: CustomClaims;

  constructor(authData: { uid: string; token?: CustomClaims } | undefined) {
    if (authData?.uid === undefined) {
      throw new HttpsError("unauthenticated", "User is not authenticated.");
    }
    this.userId = authData.uid;
    this.claims = authData.token ?? {};
  }

  checkDisabled(): void {
    if (this.claims.disabled === true) {
      throw new HttpsError("permission-denied", "User is disabled.");
    }
  }

  checkAdmin(): void {
    if (this.claims.type !== UserType.admin) {
      throw new HttpsError(
        "permission-denied",
        "User does not have permission.",
      );
    }
  }

  checkOwnerOrClinician(): void {
    this.checkDisabled();

    if (
      this.claims.type !== UserType.owner &&
      this.claims.type !== UserType.clinician
    ) {
      throw new HttpsError(
        "permission-denied",
        "User does not have permission.",
      );
    }
  }

  checkSelfOrOwnerOrClinician(targetUserId: string): void {
    this.checkDisabled();

    // Users can access their own data
    if (this.userId === targetUserId) return;

    // Owners and clinicians can access patient data
    if (
      this.claims.type === UserType.owner ||
      this.claims.type === UserType.clinician
    ) {
      return;
    }

    throw new HttpsError("permission-denied", "User does not have permission.");
  }

  checkAuthenticated(): void {
    if (!this.userId) {
      throw new HttpsError("unauthenticated", "User is not authenticated.");
    }

    this.checkDisabled();
  }
}
