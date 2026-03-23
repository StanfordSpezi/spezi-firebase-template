// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { z } from "zod/v4";
import { UserType } from "../../types/index.js";

export const updateUserInformationInputSchema = z.object({
  userId: z.string(),
  data: z.object({
    auth: z
      .object({
        displayName: z.string().optional(),
        email: z.email().optional(),
        disabled: z.boolean().optional(),
        phoneNumber: z.string().optional(),
      })
      .optional(),
    user: z
      .object({
        type: z.enum(UserType).optional(),
        organization: z.string().optional(),
        clinician: z.string().optional(),
        displayName: z.string().optional(),
        email: z.email().optional(),
        language: z.string().optional(),
        timeZone: z.string().optional(),
      })
      .optional(),
  }),
});

export type UpdateUserInformationInput = z.infer<
  typeof updateUserInformationInputSchema
>;

export interface UpdateUserInformationOutput {
  success: boolean;
}
