import {
  type User,
  type UserMessage,
} from "@stanfordbdhg/spezi-firebase-models";
import { type MessageService } from "./messageService.js";
import { CollectionsService } from "../database/collections.js";
import {
  type Document,
  type DatabaseService,
  convertDocument,
} from "../database/databaseService.js";

export class DefaultMessageService implements MessageService {
  private databaseService: DatabaseService;
  private collections: CollectionsService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
    this.collections = new CollectionsService(databaseService.firestore());
  }

  async addMessage(
    userId: string,
    message: UserMessage,
    _options: {
      notify: boolean;
      user: User | null;
    },
  ): Promise<Document<UserMessage> | undefined> {
    const messagesCollection = this.collections.userMessages(userId);
    const docRef = await messagesCollection.add(message);
    const snapshot = await docRef.get();
    return convertDocument(snapshot) as Document<UserMessage> | undefined;
  }

  async dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void> {
    const messageRef = this.collections.userMessages(userId).doc(messageId);
    await messageRef.update({
      isDismissed: true,
      didPerformAction: didPerformAction,
      completedAt: new Date(),
    });
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
