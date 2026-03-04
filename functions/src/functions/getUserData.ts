/// <reference types="fhir" />

import { observationSchema } from "@stanfordspezi/spezi-firebase-fhir";
import { getFirestore } from "firebase-admin/firestore";
import {
  onCall,
  type CallableRequest,
  HttpsError,
} from "firebase-functions/v2/https";
import { CollectionsService } from "../services/database/collections.js";

export const getUserData = onCall(
  { cors: true },
  async (request: CallableRequest) => {
    const { auth } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    try {
      const userId = auth.uid;
      const collections = new CollectionsService(getFirestore());

      const userDoc = await collections.users.doc(userId).get();
      if (!userDoc.exists) {
        throw new HttpsError("not-found", "User not found");
      }

      const user = userDoc.data();

      // Get recent step count data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const stepCountQuery = collections
        .userObservations(userId, "stepCount")
        .where("effectiveDateTime", ">=", thirtyDaysAgo.toISOString())
        .orderBy("effectiveDateTime", "desc")
        .limit(30);

      const stepCountSnapshot = await stepCountQuery.get();
      const stepCountData = stepCountSnapshot.docs.map((doc) => {
        const rawObservation = doc.data();

        // Validate the observation using the FHIR schema
        const observation = observationSchema.parse(rawObservation);

        return {
          id: doc.id,
          date: observation.effectiveDateTime,
          steps: observation.valueQuantity?.value ?? 0,
        };
      });

      return {
        user: user ?? {},
        stepCountData,
      };
    } catch (error) {
      console.error("Error getting user data:", error);
      throw new HttpsError("internal", "Failed to get user data");
    }
  },
);
