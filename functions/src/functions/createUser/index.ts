// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { getFirestore } from "firebase-admin/firestore";
import { validatedOnCall } from "../../helpers/validatedOnCall.js";
import { Credential } from "../../services/auth/credential.js";
import { DefaultDatabaseService } from "../../services/database/databaseService.js";
import { DefaultUserService } from "../../services/user/defaultUserService.js";
import { createUserInputSchema, type CreateUserOutput } from "./schema.js";

export const createUser = validatedOnCall(
  createUserInputSchema,
  async (request): Promise<CreateUserOutput> => {
    const credential = new Credential(request.auth);
    credential.checkOwnerOrClinician();

    const databaseService = new DefaultDatabaseService(getFirestore());
    const userService = new DefaultUserService(databaseService);

    const userId = await userService.createUser({
      auth: request.data.auth,
      user: request.data.user,
    });

    return { userId };
  },
);
