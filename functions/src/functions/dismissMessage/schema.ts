// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { z } from "zod/v4";

export const dismissMessageInputSchema = z.object({
  messageId: z.string().min(1, "Message ID cannot be empty"),
  didPerformAction: z.boolean().optional().default(false),
});

export type DismissMessageInput = z.infer<typeof dismissMessageInputSchema>;

export interface DismissMessageOutput {
  success: boolean;
}
