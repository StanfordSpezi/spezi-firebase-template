// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { type User, type UserMessage } from "../../types/index.js";
import { type Document } from "../database/databaseService.js";

export interface MessageService {
  addMessage(
    userId: string,
    message: UserMessage,
    options: {
      notify: boolean;
      user: User | null;
    },
  ): Promise<Document<UserMessage> | undefined>;

  dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void>;

  dismissMessages(
    userId: string,
    options: {
      messageIds?: string[];
      dismissAll?: boolean;
      didPerformAction: boolean;
    },
  ): Promise<number>;
}
