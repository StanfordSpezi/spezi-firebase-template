// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

/// <reference types="fhir" />
import { observationSchema } from "@stanfordspezi/spezi-firebase-fhir";
import { SchemaConverter } from "@stanfordspezi/spezi-firebase-utils";
import { z } from "zod/v4";

export {
  LocalizedText,
  localizedTextConverter,
} from "@stanfordspezi/spezi-firebase-utils";

export type UserObservationCollection =
  | "stepCount"
  | "bodyWeight"
  | "heartRate";

export enum UserType {
  admin = "admin",
  owner = "owner",
  clinician = "clinician",
  patient = "patient",
}

export enum UserMessageType {
  info = "info",
  warning = "warning",
  reminder = "reminder",
}

export class User {
  readonly type: UserType;
  readonly disabled: boolean;
  readonly organization?: string;
  readonly clinician?: string;
  readonly displayName?: string;
  readonly email?: string;
  readonly phoneNumbers: string[];
  readonly language?: string;
  readonly timeZone?: string;
  readonly createdAt: Date;
  readonly lastActiveDate: Date;

  constructor(input: {
    type: UserType;
    disabled: boolean;
    organization?: string;
    clinician?: string;
    displayName?: string;
    email?: string;
    phoneNumbers: string[];
    language?: string;
    timeZone?: string;
    createdAt: Date;
    lastActiveDate: Date;
  }) {
    this.type = input.type;
    this.disabled = input.disabled;
    this.organization = input.organization;
    this.clinician = input.clinician;
    this.displayName = input.displayName;
    this.email = input.email;
    this.phoneNumbers = input.phoneNumbers;
    this.language = input.language;
    this.timeZone = input.timeZone;
    this.createdAt = input.createdAt;
    this.lastActiveDate = input.lastActiveDate;
  }
}

export type UpdatableUserInfo = Pick<
  User,
  | "type"
  | "displayName"
  | "email"
  | "organization"
  | "clinician"
  | "language"
  | "timeZone"
>;

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

export class UserMessage {
  readonly type: UserMessageType;
  readonly title: string;
  readonly description: string;
  readonly action?: string;
  readonly isDismissed: boolean;
  readonly didPerformAction: boolean;
  readonly createdAt: Date;
  readonly completedAt?: Date;

  constructor(input: {
    type: UserMessageType;
    title: string;
    description: string;
    action?: string;
    isDismissed?: boolean;
    didPerformAction?: boolean;
    createdAt: Date;
    completedAt?: Date;
  }) {
    this.type = input.type;
    this.title = input.title;
    this.description = input.description;
    this.action = input.action;
    this.isDismissed = input.isDismissed ?? false;
    this.didPerformAction = input.didPerformAction ?? false;
    this.createdAt = input.createdAt;
    this.completedAt = input.completedAt;
  }
}

export const userConverter = new SchemaConverter({
  schema: z
    .object({
      type: z.enum(UserType),
      disabled: z.boolean().default(false),
      organization: z.string().optional(),
      clinician: z.string().optional(),
      displayName: z.string().optional(),
      email: z.email().optional(),
      phoneNumbers: z.array(z.string()).default([]),
      language: z.string().optional(),
      timeZone: z.string().optional(),
      createdAt: z.date(),
      lastActiveDate: z.date(),
    })
    .transform((values) => new User(values)),
  encode: (object) => ({
    type: object.type,
    disabled: object.disabled,
    organization: object.organization,
    clinician: object.clinician,
    displayName: object.displayName,
    email: object.email,
    phoneNumbers: object.phoneNumbers,
    language: object.language,
    timeZone: object.timeZone,
    createdAt: object.createdAt,
    lastActiveDate: object.lastActiveDate,
  }),
});

export const userAuthConverter = new SchemaConverter({
  schema: z
    .object({
      displayName: z.string().optional(),
      email: z.email().optional(),
      emailVerified: z.boolean().default(false),
      disabled: z.boolean().default(false),
      phoneNumber: z.string().optional(),
      customClaims: z.record(z.string(), z.unknown()).optional(),
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

export const userMessageConverter = new SchemaConverter({
  schema: z
    .object({
      type: z.enum([
        UserMessageType.info,
        UserMessageType.warning,
        UserMessageType.reminder,
      ]),
      title: z.string(),
      description: z.string(),
      action: z.string().optional(),
      isDismissed: z.boolean().optional().default(false),
      didPerformAction: z.boolean().optional().default(false),
      createdAt: z.date(),
      completedAt: z.date().optional(),
    })
    .transform((values) => new UserMessage(values)),
  encode: (object) => ({
    type: object.type,
    title: object.title,
    description: object.description,
    action: object.action,
    isDismissed: object.isDismissed,
    didPerformAction: object.didPerformAction,
    createdAt: object.createdAt,
    completedAt: object.completedAt,
  }),
});

export class Organization {
  readonly name: string;

  constructor(input: { name: string }) {
    this.name = input.name;
  }
}

export const organizationConverter = new SchemaConverter({
  schema: z
    .object({
      name: z.string(),
    })
    .transform((values) => new Organization(values)),
  encode: (object) => ({
    name: object.name,
  }),
});

export const fhirObservationConverter = new SchemaConverter({
  schema: observationSchema,
  encode: (value) => value,
});
