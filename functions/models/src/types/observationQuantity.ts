// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { QuantityUnit } from '../codes/quantityUnit.js'

export interface ObservationQuantity {
  date: Date;
  value: number;
  unit: QuantityUnit;
}
