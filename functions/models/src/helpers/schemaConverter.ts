import { type ZodSchema } from "zod";

export class SchemaConverter<T, U> {
  readonly schema: ZodSchema<T>;
  readonly encode: (object: T) => U;

  constructor(input: { schema: ZodSchema<T>; encode: (object: T) => U }) {
    this.schema = input.schema;
    this.encode = input.encode;
  }
}
