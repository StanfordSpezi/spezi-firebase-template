// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { type Firestore } from "firebase-admin/firestore";
import {
  DatabaseConverter,
  FHIRDatabaseConverter,
} from "./databaseConverter.js";
import {
  fhirObservationConverter,
  fhirQuestionnaireResponseConverter,
  organizationConverter,
  userConverter,
  userMessageConverter,
  type UserObservationCollection,
} from "../../types/index.js";

export class CollectionsService {
  readonly firestore: Firestore;

  constructor(firestore: Firestore) {
    this.firestore = firestore;
  }

  get organizations() {
    return this.firestore
      .collection("organizations")
      .withConverter(new DatabaseConverter(organizationConverter));
  }

  get users() {
    return this.firestore
      .collection("users")
      .withConverter(new DatabaseConverter(userConverter));
  }

  userMessages(userId: string) {
    return this.firestore
      .collection("users")
      .doc(userId)
      .collection("messages")
      .withConverter(new DatabaseConverter(userMessageConverter));
  }

  userObservations(userId: string, collection: UserObservationCollection) {
    return this.firestore
      .collection("users")
      .doc(userId)
      .collection(collection)
      .withConverter(new FHIRDatabaseConverter(fhirObservationConverter));
  }

  userQuestionnaireResponses(userId: string) {
    return this.firestore
      .collection("users")
      .doc(userId)
      .collection("questionnaireResponses")
      .withConverter(new FHIRDatabaseConverter(fhirQuestionnaireResponseConverter));
  }
}
