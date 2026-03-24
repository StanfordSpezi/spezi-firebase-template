// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { createUserInputSchema, type CreateUserOutput } from "./schema.js";
import { validatedOnCall } from "../../helpers/validatedOnCall.js";
import { Credential } from "../../services/auth/credential.js";
import { UserRole } from "../../services/auth/userRole.js";
import { DefaultDatabaseService } from "../../services/database/databaseService.js";
import { DefaultOrganizationService } from "../../services/organization/defaultOrganizationService.js";
import { DefaultUserService } from "../../services/user/defaultUserService.js";
import { UserType } from "../../types/index.js";

export const createUser = validatedOnCall(
  createUserInputSchema,
  async (request): Promise<CreateUserOutput> => {
    const credential = new Credential(request.auth);
    const databaseService = new DefaultDatabaseService(getFirestore());
    const organizationService = new DefaultOrganizationService(databaseService);
    const targetType = request.data.user.type;
    const targetOrg = request.data.user.organization;

    if (targetType === UserType.admin) {
      credential.check(UserRole.admin);
    } else if (targetOrg !== undefined) {
      credential.check(
        UserRole.admin,
        UserRole.owner(targetOrg),
        targetType === UserType.patient ? UserRole.clinician(targetOrg) : null,
      );
    } else {
      throw credential.permissionDeniedError();
    }

    if (targetOrg !== undefined) {
      const organizationExists =
        await organizationService.organizationExists(targetOrg);
      if (!organizationExists) {
        throw new HttpsError(
          "not-found",
          `Organization '${targetOrg}' does not exist.`,
        );
      }
    }

    const userService = new DefaultUserService(databaseService);

    const userId = await userService.createUser({
      auth: {
        ...request.data.auth,
        customClaims: {
          type: request.data.user.type,
          ...(request.data.user.organization && {
            organization: request.data.user.organization,
          }),
        },
      },
      user: request.data.user,
    });

    return { userId };
  },
);
