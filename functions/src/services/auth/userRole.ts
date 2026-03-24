// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { type CustomClaims, UserType } from "../../types/index.js";

type UserRoleType = UserType | "user";

export class UserRole {
  readonly type: UserRoleType;
  readonly organization?: string;
  readonly userId?: string;

  private constructor(
    type: UserRoleType,
    organization?: string,
    userId?: string,
  ) {
    this.type = type;
    this.organization = organization;
    this.userId = userId;
  }

  matches(claims: CustomClaims, userId: string): boolean {
    switch (this.type) {
      case UserType.admin:
        return claims.type === UserType.admin;
      case UserType.owner:
        return (
          claims.type === UserType.owner &&
          claims.organization === this.organization
        );
      case UserType.clinician:
        return (
          claims.type === UserType.clinician &&
          claims.organization === this.organization
        );
      case UserType.patient:
        return (
          claims.type === UserType.patient &&
          claims.organization === this.organization
        );
      case "user":
        return userId === this.userId;
    }
  }

  static readonly admin = new UserRole(UserType.admin);

  static owner(organizationId: string): UserRole {
    return new UserRole(UserType.owner, organizationId);
  }

  static clinician(organizationId: string): UserRole {
    return new UserRole(UserType.clinician, organizationId);
  }

  static patient(organizationId: string): UserRole {
    return new UserRole(UserType.patient, organizationId);
  }

  static user(userId: string): UserRole {
    return new UserRole("user", undefined, userId);
  }
}
