import { type DocumentSnapshot, type Firestore } from 'firebase-admin/firestore'

export interface Document<T> {
  id: string
  data: T
}

export interface DatabaseService {
  firestore(): Firestore
}

export class DefaultDatabaseService implements DatabaseService {
  private _firestore: Firestore

  constructor(firestore: Firestore) {
    this._firestore = firestore
  }

  firestore(): Firestore {
    return this._firestore
  }
}

export function convertDocument<T>(snapshot: DocumentSnapshot<T>): Document<T> | undefined {
  const data = snapshot.data()
  return data ? { id: snapshot.id, data } : undefined
}