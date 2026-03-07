  // This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { type ZodSchema } from 'zod/v4'

export class SchemaConverter<T, U> {
  readonly schema: ZodSchema<T>;
  readonly encode: (object: T) => U;

  constructor(input: { schema: ZodSchema<T>; encode: (object: T) => U }) {
    this.schema = input.schema;
    this.encode = input.encode;
  }
}
