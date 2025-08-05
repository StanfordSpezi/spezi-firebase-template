import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import {
  onCall,
  type CallableRequest,
  HttpsError,
} from "firebase-functions/v2/https";
import {
  createRegisterDeviceHandler,
  FirebaseNotificationService,
  FirestoreDeviceStorage,
} from "@stanfordspezi/spezi-firebase-cloud-messaging";

const notificationService = new FirebaseNotificationService(
  getMessaging(),
  new FirestoreDeviceStorage(getFirestore())
);

const registerDeviceHandler = createRegisterDeviceHandler(notificationService);

export const registerDevice = onCall(
  { cors: true },
  async (request: CallableRequest) => {
    const { auth } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    try {
      return await registerDeviceHandler(auth.uid, request.data);
    } catch (error) {
      console.error("Error registering device:", error);
      throw new HttpsError("internal", "Failed to register device");
    }
  },
);