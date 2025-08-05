import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import {
  onCall,
  type CallableRequest,
  HttpsError,
} from "firebase-functions/v2/https";
import {
  createUnregisterDeviceHandler,
  FirebaseNotificationService,
  FirestoreDeviceStorage,
} from "@stanfordspezi/spezi-firebase-cloud-messaging";

const notificationService = new FirebaseNotificationService(
  getMessaging(),
  new FirestoreDeviceStorage(getFirestore())
);

const unregisterDeviceHandler = createUnregisterDeviceHandler(notificationService);

export const unregisterDevice = onCall(
  { cors: true },
  async (request: CallableRequest) => {
    const { auth } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    try {
      return await unregisterDeviceHandler(auth.uid, request.data);
    } catch (error) {
      console.error("Error unregistering device:", error);
      throw new HttpsError("internal", "Failed to unregister device");
    }
  },
);