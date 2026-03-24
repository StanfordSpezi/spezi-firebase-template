// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { getFirestore } from "firebase-admin/firestore";
import { createUserInputSchema, type CreateUserOutput } from "./schema.js";
import { validatedOnCall } from "../../helpers/validatedOnCall.js";
import { Credential } from "../../services/auth/credential.js";
import { UserRole } from "../../services/auth/userRole.js";
import { DefaultDatabaseService } from "../../services/database/databaseService.js";
import { DefaultUserService } from "../../services/user/defaultUserService.js";
import { UserType } from "../../types/index.js";

export const createUser = validatedOnCall(
  createUserInputSchema,
  async (request): Promise<CreateUserOutput> => {
    const credential = new Credential(request.auth);
    if (request.data.user.type === UserType.admin) {
      credential.check(UserRole.admin);
    } else if (request.data.user.organization !== undefined) {
      credential.check(
        UserRole.admin,
        UserRole.owner(request.data.user.organization),
        UserRole.clinician(request.data.user.organization),
      );
    } else {
      throw credential.permissionDeniedError();
    }

    const databaseService = new DefaultDatabaseService(getFirestore());
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
