// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import {
  FirebaseNotificationService,
  FirestoreDeviceStorage,
  Message,
} from "@stanfordspezi/spezi-firebase-cloud-messaging";
import { getMessaging } from "firebase-admin/messaging";
import { type MessageService } from "./messageService.js";
import { type User, type UserMessage } from "../../types/index.js";
import { CollectionsService } from "../database/collections.js";
import {
  type Document,
  type DatabaseService,
  convertDocument,
} from "../database/databaseService.js";

export class DefaultMessageService implements MessageService {
  private databaseService: DatabaseService;
  private collections: CollectionsService;
  private notificationService: FirebaseNotificationService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
    this.collections = new CollectionsService(databaseService.firestore());
    this.notificationService = new FirebaseNotificationService(
      getMessaging(),
      new FirestoreDeviceStorage(databaseService.firestore()),
    );
  }

  async addMessage(
    userId: string,
    message: UserMessage,
    options: {
      notify: boolean;
      user: User | null;
    },
  ): Promise<Document<UserMessage> | undefined> {
    const messagesCollection = this.collections.userMessages(userId);
    const docRef = await messagesCollection.add(message);
    const snapshot = await docRef.get();

    // Send push notification if requested
    if (options.notify) {
      try {
        const notificationMessage = Message.createInformation({
          title: { en: message.title },
          description: { en: message.description },
          action: message.action,
          isDismissible: !message.isDismissed,
        });

        await this.notificationService.sendMessageNotification(userId, {
          id: docRef.id,
          path: `/users/${userId}/messages/${docRef.id}`,
          lastUpdate: new Date(),
          content: notificationMessage,
        });
      } catch (error) {
        console.error("Failed to send push notification:", error);
        // Don't fail the entire operation if notification fails
      }
    }

    return convertDocument(snapshot);
  }

  async dismissMessages(
    userId: string,
    options: {
      messageIds?: string[];
      dismissAll?: boolean;
      didPerformAction: boolean;
    },
  ): Promise<number> {
    const messagesCollection = this.collections.userMessages(userId);

    let query = messagesCollection.where("isDismissed", "==", false);

    if (options.messageIds && !options.dismissAll) {
      query = query.where("__name__", "in", options.messageIds);
    }

    const querySnapshot = await query.get();
    const batch = this.databaseService.firestore().batch();

    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        isDismissed: true,
        didPerformAction: options.didPerformAction,
        completedAt: new Date(),
      });
    });

    await batch.commit();
    return querySnapshot.size;
  }
}
