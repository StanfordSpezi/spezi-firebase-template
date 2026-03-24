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
import { UserRole } from "../../services/auth/userRole.js";
import { DefaultDatabaseService } from "../../services/database/databaseService.js";
import { DefaultUserService } from "../../services/user/defaultUserService.js";
import { UserType } from "../../types/index.js";

export const updateUserInformation = validatedOnCall(
  updateUserInformationInputSchema,
  async (request): Promise<UpdateUserInformationOutput> => {
    const credential = new Credential(request.auth);
    const databaseService = new DefaultDatabaseService(getFirestore());
    const userService = new DefaultUserService(databaseService);
    const targetUserId = request.data.userId;

    const role = await credential.checkAsync(
      () => [UserRole.admin, UserRole.user(targetUserId)],
      async () => {
        const user = await userService.getUser(targetUserId);
        return user?.data.organization !== undefined ?
            [
              UserRole.owner(user.data.organization),
              user.data.type === UserType.patient ?
                UserRole.clinician(user.data.organization)
              : null,
            ]
          : [];
      },
    );

    const isSelf = credential.userId === targetUserId;
    const securityFieldsModified =
      !!request.data.data.user?.type ||
      !!request.data.data.user?.organization ||
      request.data.data.auth?.disabled !== undefined;

    if (isSelf && securityFieldsModified) {
      throw credential.permissionDeniedError();
    }
    if (role.type === UserType.clinician && securityFieldsModified) {
      throw credential.permissionDeniedError();
    }

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
