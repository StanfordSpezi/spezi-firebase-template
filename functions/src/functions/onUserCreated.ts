// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { DefaultDatabaseService } from "../services/database/databaseService.js";
import { DefaultMessageService } from "../services/message/defaultMessageService.js";
import { UserMessage, UserMessageType, UserType } from "../types/index.js";

export const onUserCreated = onDocumentCreated(
  "users/{userId}",
  async (event) => {
    const userId = event.params.userId;
    const userData = event.data?.data();

    if (!userData) return;

    const databaseService = new DefaultDatabaseService(getFirestore());
    const messageService = new DefaultMessageService(databaseService);

    // Send welcome message based on user type
    let welcomeMessage: UserMessage;

    switch (userData.type) {
      case UserType.patient:
        welcomeMessage = new UserMessage({
          type: UserMessageType.welcome,
          title: "Welcome to Your Health Journey!",
          description:
            "Start tracking your daily steps and health metrics to improve your wellbeing.",
          isDismissed: false,
          didPerformAction: false,
          createdAt: new Date(),
        });
        break;
      case UserType.clinician:
        welcomeMessage = new UserMessage({
          type: UserMessageType.welcome,
          title: "Welcome, Clinician!",
          description:
            "You can now monitor your patients' health data and provide better care.",
          isDismissed: false,
          didPerformAction: false,
          createdAt: new Date(),
        });
        break;
      case UserType.owner:
      case UserType.admin:
        welcomeMessage = new UserMessage({
          type: UserMessageType.welcome,
          title: "Welcome, Administrator!",
          description:
            "You have full access to manage users and monitor the system.",
          isDismissed: false,
          didPerformAction: false,
          createdAt: new Date(),
        });
        break;
      default:
        return;
    }

    await messageService.addMessage(userId, welcomeMessage, {
      notify: true,
      user: null,
    });
  },
);
