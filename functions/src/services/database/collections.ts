import {
  fhirObservationConverter,
  fhirQuestionnaireResponseConverter,
  userConverter,
  userMessageConverter,
  type UserObservationCollection,
} from "@stanfordbdhg/spezi-firebase-models";
import { type Firestore } from "firebase-admin/firestore";
import {
  DatabaseConverter,
  FHIRDatabaseConverter,
} from "./databaseConverter.js";

export class CollectionsService {
  readonly firestore: Firestore;

  constructor(firestore: Firestore) {
    this.firestore = firestore;
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
      .withConverter(
        new FHIRDatabaseConverter(fhirQuestionnaireResponseConverter),
      );
  }
}
