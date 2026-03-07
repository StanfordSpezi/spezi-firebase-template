// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { z } from "zod/v4";
import { SchemaConverter } from "../helpers/schemaConverter.js";

export enum UserMessageType {
  info = "info",
  warning = "warning",
  reminder = "reminder",
}

export const userMessageConverter = new SchemaConverter({
  schema: z
    .object({
      type: z.nativeEnum(UserMessageType),
      title: z.string(),
      description: z.string(),
      action: z.string().optional(),
      isDismissed: z.boolean().default(false),
      didPerformAction: z.boolean().default(false),
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
    isDismissed: boolean;
    didPerformAction: boolean;
    createdAt: Date;
    completedAt?: Date;
  }) {
    this.type = input.type;
    this.title = input.title;
    this.description = input.description;
    this.action = input.action;
    this.isDismissed = input.isDismissed;
    this.didPerformAction = input.didPerformAction;
    this.createdAt = input.createdAt;
    this.completedAt = input.completedAt;
  }
}
