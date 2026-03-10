// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

/// <reference types="fhir" />

import { observationSchema } from "@stanfordspezi/spezi-firebase-fhir";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { z } from "zod/v4";
import { validatedOnCall } from "../helpers/validatedOnCall.js";
import { CollectionsService } from "../services/database/collections.js";

const addStepCountDataSchema = z.object({
  date: z.iso.datetime(),
  steps: z.number().int().min(0).max(100000),
});

export const addStepCount = validatedOnCall(
  addStepCountDataSchema,
  async (request) => {
    const { auth, data } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const date = new Date(data.date);
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
        value: data.steps,
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
  },
);
