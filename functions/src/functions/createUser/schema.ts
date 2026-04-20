// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { z } from "zod/v4";
import { UserType } from "../../types/index.js";

export const createUserInputSchema = z.object({
  auth: z.object({
    email: z.email(),
    displayName: z.string().optional(),
  }),
  user: z.object({
    type: z.enum(UserType),
    organization: z.string().optional(),
    clinician: z.string().optional(),
  }),
});

export type CreateUserInput = z.input<typeof createUserInputSchema>;

export interface CreateUserOutput {
  userId: string;
}
