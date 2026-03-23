// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { getFirestore } from "firebase-admin/firestore";
import { createUserInputSchema, type CreateUserOutput } from "./schema.js";
import { validatedOnCall } from "../../helpers/validatedOnCall.js";
import { Credential } from "../../services/auth/credential.js";
import { DefaultDatabaseService } from "../../services/database/databaseService.js";
import { DefaultUserService } from "../../services/user/defaultUserService.js";

export const createUser = validatedOnCall(
  createUserInputSchema,
  async (request): Promise<CreateUserOutput> => {
    const credential = new Credential(request.auth);
    // TODO: Clinician should be able to create patients, owner should be able to create patients and clinicians, admin should be able to create all?
    credential.checkOwnerOrClinician();

    const databaseService = new DefaultDatabaseService(getFirestore());
    const userService = new DefaultUserService(databaseService);

    const userId = await userService.createUser({
      auth: {
        ...request.data.auth,
        customClaims: {
          type: request.data.user.type,
        },
      },
      user: request.data.user,
    });

    return { userId };
  },
);
