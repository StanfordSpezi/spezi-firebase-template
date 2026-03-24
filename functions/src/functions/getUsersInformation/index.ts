// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import {
  getUsersInformationInputSchema,
  type GetUsersInformationOutput,
} from "./schema.js";
import { validatedOnCall } from "../../helpers/validatedOnCall.js";
import { Credential } from "../../services/auth/credential.js";
import { UserRole } from "../../services/auth/userRole.js";
import { DefaultDatabaseService } from "../../services/database/databaseService.js";
import { DefaultUserService } from "../../services/user/defaultUserService.js";
import { userAuthConverter, userConverter } from "../../types/index.js";

export const getUsersInformation = validatedOnCall(
  getUsersInformationInputSchema,
  async (request): Promise<GetUsersInformationOutput> => {
    const credential = new Credential(request.auth);
    const databaseService = new DefaultDatabaseService(getFirestore());
    const userService = new DefaultUserService(databaseService);

    const result: GetUsersInformationOutput = {};

    for (const userId of request.data.userIds) {
      try {
        const userData = await userService.getUser(userId);

        credential.check(
          UserRole.admin,
          UserRole.user(userId),
          ...(userData?.data.organization ?
            [
              UserRole.owner(userData.data.organization),
              UserRole.clinician(userData.data.organization),
            ]
          : []),
        );

        const authData = await userService.getAuth(userId);

        result[userId] = {
          data: {
            auth: userAuthConverter.encode(authData),
            user:
              request.data.includeUserData && userData !== undefined ?
                userConverter.encode(userData.data)
              : undefined,
          },
        };
      } catch (error) {
        if (error instanceof HttpsError) {
          result[userId] = {
            error: {
              code: error.code,
              message: error.message,
            },
          };
        } else if (error instanceof Error) {
          result[userId] = {
            error: {
              code: "internal",
              message: error.message,
            },
          };
        } else {
          result[userId] = {
            error: {
              code: "internal",
              message: "Internal server error",
            },
          };
        }
      }
    }

    return result;
  },
);
