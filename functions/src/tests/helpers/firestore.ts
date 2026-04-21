// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import admin from "firebase-admin";

const FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
const AUTH_EMULATOR_HOST = "127.0.0.1:9099";
const PROJECT_ID = "spezi-firebase-template";

export const clearFirestore = async (): Promise<void> => {
  await fetch(
    `http://${FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: "DELETE" },
  );
};

export const deleteAllAuthUsers = async (): Promise<void> => {
  await fetch(
    `http://${AUTH_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/accounts`,
    { method: "DELETE" },
  );
};

export const createUserDoc = async (
  userId: string,
  data: {
    type: "patient" | "clinician" | "owner";
    disabled?: boolean;
    displayName?: string;
    email?: string;
  },
): Promise<void> => {
  const doc: Record<string, unknown> = {
    type: data.type,
    disabled: data.disabled ?? false,
    phoneNumbers: [],
    createdAt: admin.firestore.Timestamp.now(),
    lastActiveDate: admin.firestore.Timestamp.now(),
  };
  if (data.displayName !== undefined) doc.displayName = data.displayName;
  if (data.email !== undefined) doc.email = data.email;

  await admin.firestore().collection("users").doc(userId).set(doc);
};

export const createObservationDoc = async (
  userId: string,
  collection: string,
  observationId: string,
  data: { steps: number; effectiveDateTime: string },
): Promise<void> => {
  await admin
    .firestore()
    .collection("users")
    .doc(userId)
    .collection(collection)
    .doc(observationId)
    .set({
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
      effectiveDateTime: data.effectiveDateTime,
    });
};

export const createMessageDoc = async (
  userId: string,
  data: {
    type?: string;
    title: string;
    description: string;
    isDismissed?: boolean;
    didPerformAction?: boolean;
  },
): Promise<string> => {
  const ref = await admin
    .firestore()
    .collection("users")
    .doc(userId)
    .collection("messages")
    .add({
      type: data.type ?? "info",
      title: data.title,
      description: data.description,
      isDismissed: data.isDismissed ?? false,
      didPerformAction: data.didPerformAction ?? false,
      createdAt: admin.firestore.Timestamp.now(),
    });
  return ref.id;
};

export const getUserMessages = async (
  userId: string,
): Promise<FirebaseFirestore.QueryDocumentSnapshot[]> => {
  const snapshot = await admin
    .firestore()
    .collection("users")
    .doc(userId)
    .collection("messages")
    .get();
  return snapshot.docs;
};

export const getUserObservations = async (
  userId: string,
  collection: string,
): Promise<FirebaseFirestore.QueryDocumentSnapshot[]> => {
  const snapshot = await admin
    .firestore()
    .collection("users")
    .doc(userId)
    .collection(collection)
    .get();
  return snapshot.docs;
};

export const getUserDevices = async (
  userId: string,
): Promise<FirebaseFirestore.QueryDocumentSnapshot[]> => {
  const snapshot = await admin
    .firestore()
    .collection("users")
    .doc(userId)
    .collection("devices")
    .get();
  return snapshot.docs;
};

export const waitForCondition = async (
  condition: () => Promise<boolean>,
  timeoutMs = 10000,
  intervalMs = 500,
): Promise<void> => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await condition()) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("waitForCondition timed out");
};
