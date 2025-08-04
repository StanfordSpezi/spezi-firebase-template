import { FHIRObservation } from "@stanfordbdhg/spezi-firebase-models";
import { getFirestore } from "firebase-admin/firestore";
import {
  onCall,
  type CallableRequest,
  HttpsError,
} from "firebase-functions/v2/https";
import { CollectionsService } from "../services/database/collections.js";

interface AddStepCountData {
  date: string;
  steps: number;
}

export const addStepCount = onCall(
  { cors: true },
  async (request: CallableRequest<AddStepCountData>) => {
    const { auth, data } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    if (!data.date || typeof data.steps !== "number" || data.steps < 0) {
      throw new HttpsError("invalid-argument", "Invalid step count data");
    }

    try {
      const date = new Date(data.date);
      const userId = auth.uid;
      const collections = new CollectionsService(getFirestore());

      const observationId = `${userId}-${date.getTime()}`;
      const observation = FHIRObservation.createStepCount({
        id: observationId,
        date: date,
        steps: data.steps,
      });

      const stepCountCollection = collections.userObservations(
        userId,
        "stepCount",
      );
      await stepCountCollection.doc(observationId).set(observation);

      return { success: true, observationId };
    } catch (error) {
      console.error("Error adding step count:", error);
      throw new HttpsError("internal", "Failed to add step count");
    }
  },
);
