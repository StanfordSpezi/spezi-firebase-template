// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { deleteUserInputSchema } from "@stanfordspezi/spezi-firebase-template-models";
import { getFirestore } from "firebase-admin/firestore";
import { validatedOnCall } from "../helpers/validatedOnCall.js";
import { Credential } from "../services/auth/credential.js";
import { DefaultDatabaseService } from "../services/database/databaseService.js";
import { DefaultUserService } from "../services/user/defaultUserService.js";

export const deleteUser = validatedOnCall(
  deleteUserInputSchema,
  async (request): Promise<{ success: boolean }> => {
    const credential = new Credential(request.auth);
    credential.checkOwnerOrClinician();

    const databaseService = new DefaultDatabaseService(getFirestore());
    const userService = new DefaultUserService(databaseService);

    await userService.deleteUser(request.data.userId);

    return { success: true };
  },
);
