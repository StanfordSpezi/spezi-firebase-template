// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

/// <reference types="fhir" />

import { getFirestore } from "firebase-admin/firestore";
import {
  onCall,
  type CallableRequest,
  HttpsError,
} from "firebase-functions/v2/https";
import { CollectionsService } from "../services/database/collections.js";
import { observationSchema } from "@stanfordspezi/spezi-firebase-fhir";
import { z } from "zod";

const addStepCountDataSchema = z.object({
  date: z.string().datetime(),
  steps: z.number().int().min(0).max(100000),
});

type AddStepCountData = z.infer<typeof addStepCountDataSchema>;

export const addStepCount = onCall(
  { cors: true },
  async (request: CallableRequest<AddStepCountData>) => {
    const { auth, data } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    // Validate input using Zod schema
    const validationResult = addStepCountDataSchema.safeParse(data);
    if (!validationResult.success) {
      throw new HttpsError(
        "invalid-argument", 
        `Invalid step count data: ${validationResult.error.message}`
      );
    }

    try {
      const validatedData = validationResult.data;
      const date = new Date(validatedData.date);
      const userId = auth.uid;
      const collections = new CollectionsService(getFirestore());

      // Create FHIR R4B Observation directly using the standardized schema
      const observationId = `${userId}-${date.getTime()}`;
      const observation: fhir4b.Observation = {
        resourceType: "Observation",
        id: observationId,
        status: "final",
        code: {
          text: "Number of steps in 24 hour Measured",
          coding: [
            {
              system: "http://loinc.org",
              code: "55423-8",
              display: "Number of steps in 24 hour Measured",
            },
          ],
        },
        valueQuantity: {
          value: validatedData.steps,
          unit: "steps",
          system: "http://unitsofmeasure.org",
          code: "{steps}",
        },
        effectiveDateTime: date.toISOString(),
      };

      // Validate the observation using the FHIR schema
      const validatedObservation = observationSchema.parse(observation);

      const stepCountCollection = collections.userObservations(
        userId,
        "stepCount",
      );
      await stepCountCollection.doc(observationId).set(validatedObservation);

      return { success: true, observationId };
    } catch (error) {
      console.error("Error adding step count:", error);
      throw new HttpsError("internal", "Failed to add step count");
    }
  },
);
