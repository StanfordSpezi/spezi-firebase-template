// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

/// <reference types="fhir" />
import { observationSchema } from "@stanfordspezi/spezi-firebase-fhir";
import { SchemaConverter } from "@stanfordspezi/spezi-firebase-utils";
import { z } from "zod";

export type UserObservationCollection =
  | "stepCount"
  | "bodyWeight"
  | "heartRate";

export enum UserType {
  owner = "owner",
  clinician = "clinician",
  patient = "patient",
}

export enum UserMessageType {
  info = "info",
  warning = "warning",
  reminder = "reminder",
}

export interface User {
  userType: "patient" | "clinician" | "owner";
  dateOfBirth?: string;
  name?: {
    given?: string[];
    family?: string;
  };
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

const userSchema = z.object({
  userType: z.enum(["patient", "clinician", "owner"]),
  dateOfBirth: z.string().optional(),
  name: z.object({
    given: z.array(z.string()).optional(),
    family: z.string().optional(),
  }).optional(),
});

const userMessageSchema = z
  .object({
    type: z.nativeEnum(UserMessageType),
    title: z.string(),
    description: z.string(),
    action: z.string().optional(),
    isDismissed: z.boolean().optional().default(false),
    didPerformAction: z.boolean().optional().default(false),
    createdAt: z.date(),
    completedAt: z.date().optional(),
  })
  .transform((values) => new UserMessage(values));

export const userConverter = new SchemaConverter({
  schema: userSchema as any,
  encode: (value: any) => value,
});

export const userMessageConverter = new SchemaConverter({
  schema: userMessageSchema as any,
  encode: (object: any) => ({
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

export const fhirObservationConverter = new SchemaConverter({
  schema: observationSchema as any,
  encode: (value: any) => value,
});