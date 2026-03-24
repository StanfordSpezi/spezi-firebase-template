// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { getFirestore } from "firebase-admin/firestore";
import { deleteUserInputSchema, type DeleteUserOutput } from "./schema.js";
import { validatedOnCall } from "../../helpers/validatedOnCall.js";
import { Credential } from "../../services/auth/credential.js";
import { UserRole } from "../../services/auth/userRole.js";
import { DefaultDatabaseService } from "../../services/database/databaseService.js";
import { DefaultUserService } from "../../services/user/defaultUserService.js";
import { UserType } from "../../types/index.js";

export const deleteUser = validatedOnCall(
  deleteUserInputSchema,
  async (request): Promise<DeleteUserOutput> => {
    const credential = new Credential(request.auth);
    const databaseService = new DefaultDatabaseService(getFirestore());
    const userService = new DefaultUserService(databaseService);

    await credential.checkAsync(
      () => [UserRole.admin],
      async () => {
        const user = await userService.getUser(request.data.userId);
        if (!user?.data.organization) return [];
        return [
          UserRole.owner(user.data.organization),
          user.data.type === UserType.patient ?
            UserRole.clinician(user.data.organization)
          : null,
        ];
      },
    );

    await userService.deleteUser(request.data.userId);

    return { success: true };
  },
);
