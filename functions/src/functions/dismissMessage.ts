// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import {
  dismissMessageInputSchema,
  type DismissMessageInput,
  type DismissMessageOutput,
} from "@stanfordspezi/spezi-firebase-template-models";
import { getFirestore } from "firebase-admin/firestore";
import {
  onCall,
  type CallableRequest,
  HttpsError,
} from "firebase-functions/v2/https";
import { DefaultDatabaseService } from "../services/database/databaseService.js";
import { DefaultMessageService } from "../services/message/defaultMessageService.js";

export const dismissMessage = onCall(
  { cors: true },
  async (
    request: CallableRequest<DismissMessageInput>,
  ): Promise<DismissMessageOutput> => {
    const { auth, data } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    // Validate input using Zod schema
    const validationResult = dismissMessageInputSchema.safeParse(data);
    if (!validationResult.success) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid dismiss message data: ${validationResult.error.message}`,
      );
    }

    try {
      const validatedData = validationResult.data;
      const userId = auth.uid;
      const databaseService = new DefaultDatabaseService(getFirestore());
      const messageService = new DefaultMessageService(databaseService);

      await messageService.dismissMessage(
        userId,
        validatedData.messageId,
        validatedData.didPerformAction,
      );

      return { success: true };
    } catch (error) {
      console.error("Error dismissing message:", error);
      throw new HttpsError("internal", "Failed to dismiss message");
    }
  },
);
