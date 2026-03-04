import { z } from "zod";
import { SchemaConverter } from "../helpers/schemaConverter.js";

export const userAuthConverter = new SchemaConverter({
  schema: z
    .object({
      displayName: z.string().optional(),
      email: z.string().email().optional(),
      emailVerified: z.boolean().default(false),
      disabled: z.boolean().default(false),
      phoneNumber: z.string().optional(),
      customClaims: z.record(z.unknown()).optional(),
    })
    .transform((values) => new UserAuth(values)),
  encode: (object) => ({
    displayName: object.displayName,
    email: object.email,
    emailVerified: object.emailVerified,
    disabled: object.disabled,
    phoneNumber: object.phoneNumber,
    customClaims: object.customClaims,
  }),
});

export class UserAuth {
  readonly displayName?: string;
  readonly email?: string;
  readonly emailVerified: boolean;
  readonly disabled: boolean;
  readonly phoneNumber?: string;
  readonly customClaims?: Record<string, unknown>;

  constructor(input: {
    displayName?: string;
    email?: string;
    emailVerified: boolean;
    disabled: boolean;
    phoneNumber?: string;
    customClaims?: Record<string, unknown>;
  }) {
    this.displayName = input.displayName;
    this.email = input.email;
    this.emailVerified = input.emailVerified;
    this.disabled = input.disabled;
    this.phoneNumber = input.phoneNumber;
    this.customClaims = input.customClaims;
  }
}
