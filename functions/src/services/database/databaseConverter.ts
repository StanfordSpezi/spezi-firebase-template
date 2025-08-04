import { type SchemaConverter } from "@stanfordbdhg/spezi-firebase-models";
import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";

const isSerializableObject = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof Date) &&
  !(value instanceof Timestamp);

export class DatabaseConverter<T, U> implements FirestoreDataConverter<T> {
  private converter: SchemaConverter<T, U>;

  constructor(converter: SchemaConverter<T, U>) {
    this.converter = converter;
  }

  toFirestore(modelObject: T): DocumentData {
    const data = this.converter.encode(modelObject);
    return this.convertDatesToTimestamps(data) as DocumentData;
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): T {
    const data: unknown = snapshot.data();
    const convertedData = this.convertTimestampsToDates(data);
    return this.converter.schema.parse(convertedData);
  }

  private convertDatesToTimestamps(obj: unknown): unknown {
    if (obj instanceof Date) {
      return Timestamp.fromDate(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertDatesToTimestamps(item));
    }
    if (isSerializableObject(obj)) {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.convertDatesToTimestamps(value);
      }
      return result;
    }
    return obj;
  }

  private convertTimestampsToDates(obj: unknown): unknown {
    if (obj instanceof Timestamp) {
      return obj.toDate();
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertTimestampsToDates(item));
    }
    if (isSerializableObject(obj)) {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.convertTimestampsToDates(value);
      }
      return result;
    }
    return obj;
  }
}

export class FHIRDatabaseConverter<T> extends DatabaseConverter<T, unknown> {
  constructor(converter: SchemaConverter<T, unknown>) {
    super(converter);
  }
}
