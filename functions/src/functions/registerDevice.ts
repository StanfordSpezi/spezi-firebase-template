import {
  createRegisterDeviceHandler,
  registerDeviceInputSchema,
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
import { type z } from "zod";

const notificationService = new FirebaseNotificationService(
  getMessaging(),
  new FirestoreDeviceStorage(getFirestore()),
);

const registerDeviceHandler = createRegisterDeviceHandler(notificationService);

export const registerDevice = onCall(
  { cors: true },
  async (request: CallableRequest<unknown>) => {
    const { auth, data } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    // Validate input using the provided schema from the messaging package
    const validationResult = (registerDeviceInputSchema as z.ZodType).safeParse(
      data,
    );
    if (!validationResult.success) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid device registration data: ${validationResult.error.message}`,
      );
    }

    try {
      await registerDeviceHandler(auth.uid, validationResult.data);
      return;
    } catch (error) {
      console.error("Error registering device:", error);
      throw new HttpsError("internal", "Failed to register device");
    }
  },
);
