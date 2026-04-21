// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import {
  type DocumentSnapshot,
  type Firestore,
} from "firebase-admin/firestore";

export interface Document<T> {
  id: string;
  data: T;
}

export interface DatabaseService {
  firestore(): Firestore;
}

export class DefaultDatabaseService implements DatabaseService {
  private _firestore: Firestore;

  constructor(firestore: Firestore) {
    this._firestore = firestore;
  }

  firestore(): Firestore {
    return this._firestore;
  }
}

export const convertDocument = <T>(
  snapshot: DocumentSnapshot<T>,
): Document<T> | undefined => {
  const data = snapshot.data();
  return data ? { id: snapshot.id, data } : undefined;
};
