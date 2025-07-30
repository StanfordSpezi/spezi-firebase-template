import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore'
import { type SchemaConverter } from '@stanfordbdhg/spezi-firebase-models'

export class DatabaseConverter<T, U> implements FirestoreDataConverter<T> {
  private converter: SchemaConverter<T, U>

  constructor(converter: SchemaConverter<T, U>) {
    this.converter = converter
  }

  toFirestore(modelObject: T): DocumentData {
    const data = this.converter.encode(modelObject)
    return this.convertDatesToTimestamps(data)
  }

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
  ): T {
    const data = snapshot.data()
    const convertedData = this.convertTimestampsToDates(data)
    return this.converter.schema.parse(convertedData)
  }

  private convertDatesToTimestamps(obj: any): any {
    if (obj instanceof Date) {
      return Timestamp.fromDate(obj)
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertDatesToTimestamps(item))
    }
    if (obj && typeof obj === 'object') {
      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.convertDatesToTimestamps(value)
      }
      return result
    }
    return obj
  }

  private convertTimestampsToDates(obj: any): any {
    if (obj instanceof Timestamp) {
      return obj.toDate()
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertTimestampsToDates(item))
    }
    if (obj && typeof obj === 'object') {
      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.convertTimestampsToDates(value)
      }
      return result
    }
    return obj
  }
}

export class FHIRDatabaseConverter<T> extends DatabaseConverter<T, any> {
  constructor(converter: SchemaConverter<T, any>) {
    super(converter)
  }
}