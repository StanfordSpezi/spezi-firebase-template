// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { getFirestore } from "firebase-admin/firestore";
import {
  type DismissMessagesOutput,
  dismissMessagesInputSchema,
} from "./schema.js";
import { validatedOnCall } from "../../helpers/validatedOnCall.js";
import { Credential } from "../../services/auth/credential.js";
import { UserRole } from "../../services/auth/userRole.js";
import { DefaultDatabaseService } from "../../services/database/databaseService.js";
import { DefaultMessageService } from "../../services/message/defaultMessageService.js";
import { DefaultUserService } from "../../services/user/defaultUserService.js";
import { UserType } from "../../types/index.js";

export const dismissMessages = validatedOnCall(
  dismissMessagesInputSchema,
  async (request): Promise<DismissMessagesOutput> => {
    const credential = new Credential(request.auth);
    const userId = request.data.userId ?? credential.userId;

    const databaseService = new DefaultDatabaseService(getFirestore());
    const userService = new DefaultUserService(databaseService);

    await credential.checkAsync(
      () => [UserRole.admin, UserRole.user(userId)],
      async () => {
        const user = await userService.getUser(userId);
        if (!user?.data.organization) return [];
        return [
          UserRole.owner(user.data.organization),
          user.data.type === UserType.patient ?
            UserRole.clinician(user.data.organization)
          : null,
        ];
      },
    );

    const messageService = new DefaultMessageService(databaseService);

    const dismissedCount = await messageService.dismissMessages(userId, {
      messageIds: request.data.messageIds,
      didPerformAction: request.data.didPerformAction,
    });

    return { dismissedCount };
  },
);
