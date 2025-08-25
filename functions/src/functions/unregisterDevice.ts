import {
  createUnregisterDeviceHandler,
  unregisterDeviceInputSchema,
  FirebaseNotificationService,
  FirestoreDeviceStorage,
} from "@stanfordspezi/spezi-firebase-cloud-messaging";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import {
  onCall,
  type CallableRequest,
  HttpsError,
} from "firebase-functions/v2/https";

const notificationService = new FirebaseNotificationService(
  getMessaging(),
  new FirestoreDeviceStorage(getFirestore()),
);

const unregisterDeviceHandler =
  createUnregisterDeviceHandler(notificationService);

export const unregisterDevice = onCall(
  { cors: true },
  async (request: CallableRequest<unknown>) => {
    const { auth, data } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    // Validate input using the provided schema from the messaging package
    const validationResult = unregisterDeviceInputSchema.safeParse(data);
    if (!validationResult.success) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid device unregistration data: ${validationResult.error.message}`,
      );
    }

    try {
      await unregisterDeviceHandler(auth.uid, validationResult.data);
      return;
    } catch (error) {
      console.error("Error unregistering device:", error);
      throw new HttpsError("internal", "Failed to unregister device");
    }
  },
);
