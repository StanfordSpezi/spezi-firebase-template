// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { z } from "zod/v4";

export const dismissMessagesInputSchema = z.object({
  userId: z.string().optional(),
  messageIds: z.array(z.string().min(1)),
  didPerformAction: z.boolean().optional().default(false),
});

export type DismissMessagesInput = z.input<typeof dismissMessagesInputSchema>;

export interface DismissMessagesOutput {
  dismissedCount: number;
}
