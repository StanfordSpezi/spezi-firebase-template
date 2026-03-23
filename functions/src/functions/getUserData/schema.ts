// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { type User } from "../../types/index.js";

export interface GetUserDataOutput {
  user: User | Record<string, never>;
  stepCountData: Array<{
    id: string;
    date?: string;
    steps: number;
  }>;
}
