// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { getFirestore } from "firebase-admin/firestore";
import { type DismissMessagesOutput } from "./schema.js";
import { dismissMessagesInputSchema } from "./schema.js";
import { validatedOnCall } from "../../helpers/validatedOnCall.js";
import { Credential } from "../../services/auth/credential.js";
import { DefaultDatabaseService } from "../../services/database/databaseService.js";
import { DefaultMessageService } from "../../services/message/defaultMessageService.js";

export const dismissMessages = validatedOnCall(
  dismissMessagesInputSchema,
  async (request): Promise<DismissMessagesOutput> => {
    const credential = new Credential(request.auth);
    const userId = request.data.userId ?? credential.userId;
    credential.checkSelfOrOwnerOrClinician(userId);

    const databaseService = new DefaultDatabaseService(getFirestore());
    const messageService = new DefaultMessageService(databaseService);

    const dismissedCount = await messageService.dismissMessages(userId, {
      messageIds: request.data.messageIds,
      didPerformAction: request.data.didPerformAction,
    });

    return { dismissedCount };
  },
);
