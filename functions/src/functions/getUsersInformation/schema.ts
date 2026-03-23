// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { z } from "zod/v4";

export const getUsersInformationInputSchema = z.object({
  userIds: z.array(z.string()),
  includeUserData: z.boolean().optional().default(true),
});

export type GetUsersInformationInput = z.input<
  typeof getUsersInformationInputSchema
>;

export type GetUsersInformationOutput = Record<
  string,
  {
    data?: {
      auth: Record<string, unknown>;
      user?: Record<string, unknown>;
    };
    error?: {
      code: string;
      message: string;
    };
  }
>;
