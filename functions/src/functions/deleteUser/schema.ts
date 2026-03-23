// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { z } from "zod/v4";

export const deleteUserInputSchema = z.object({
  userId: z.string(),
});

export type DeleteUserInput = z.infer<typeof deleteUserInputSchema>;

export interface DeleteUserOutput {
  success: boolean;
}
