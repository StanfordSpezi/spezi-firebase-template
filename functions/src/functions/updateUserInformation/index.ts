// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { getFirestore } from "firebase-admin/firestore";
import {
  updateUserInformationInputSchema,
  type UpdateUserInformationOutput,
} from "./schema.js";
import { validatedOnCall } from "../../helpers/validatedOnCall.js";
import { Credential } from "../../services/auth/credential.js";
import { DefaultDatabaseService } from "../../services/database/databaseService.js";
import { DefaultUserService } from "../../services/user/defaultUserService.js";

export const updateUserInformation = validatedOnCall(
  updateUserInformationInputSchema,
  async (request): Promise<UpdateUserInformationOutput> => {
    const credential = new Credential(request.auth);
    credential.checkSelfOrOwnerOrClinician(request.data.userId);

    const databaseService = new DefaultDatabaseService(getFirestore());
    const userService = new DefaultUserService(databaseService);

    // Update authentication data
    if (request.data.data.auth) {
      await userService.updateAuth(request.data.userId, request.data.data.auth);
    }

    // Update user document data
    if (request.data.data.user) {
      await userService.updateUserInfo(
        request.data.userId,
        request.data.data.user,
      );
    }

    return { success: true };
  },
);
