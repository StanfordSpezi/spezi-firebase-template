// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { type SchemaConverter } from "@stanfordspezi/spezi-firebase-utils";
import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";
import { type z } from "zod/v4";

const isSerializableObject = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof Date) &&
  !(value instanceof Timestamp);

export class DatabaseConverter<T extends z.ZodType, U>
  implements FirestoreDataConverter<z.output<T>>
{
  private converter: SchemaConverter<T, U>;

  constructor(converter: SchemaConverter<T, U>) {
    this.converter = converter;
  }

  toFirestore(modelObject: z.output<T>): DocumentData {
    const data = this.converter.encode(modelObject);
    return this.convertDatesToTimestamps(data) as DocumentData;
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): z.output<T> {
    const data: unknown = snapshot.data();
    const convertedData = this.convertTimestampsToDates(data);
    return this.converter.schema.parse(convertedData) as z.output<T>;
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

export class FHIRDatabaseConverter<
  T extends z.ZodType,
> extends DatabaseConverter<T, unknown> {}
