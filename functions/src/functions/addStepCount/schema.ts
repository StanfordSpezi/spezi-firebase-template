// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { z } from "zod/v4";

export const addStepCountInputSchema = z.object({
  date: z.iso.datetime(),
  steps: z.number().int().min(0).max(100000),
});

export type AddStepCountInput = z.infer<typeof addStepCountInputSchema>;

export interface AddStepCountOutput {
  success: boolean;
  observationId: string;
}
