// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { type Quantity } from 'fhir/r4b.js'
import { type ObservationQuantity } from '../types/observationQuantity.js'

export class QuantityUnit {
  static readonly steps = new QuantityUnit('{steps}', 'steps')
  static readonly kg = new QuantityUnit('kg', 'kg')
  static readonly lbs = new QuantityUnit('[lb_av]', 'lbs')
  static readonly bpm = new QuantityUnit('/min', 'beats/minute')

  static readonly allValues = [
    QuantityUnit.steps,
    QuantityUnit.kg,
    QuantityUnit.lbs,
    QuantityUnit.bpm,
  ]

  readonly unit: string
  readonly code: string
  readonly system: string

  constructor(
    code: string,
    unit: string,
    system = 'http://unitsofmeasure.org',
  ) {
    this.unit = unit
    this.code = code
    this.system = system
  }

  isUsedIn(other: Quantity): boolean {
    return (
      this.code === other.code &&
      this.system === other.system &&
      this.unit === other.unit
    )
  }

  equals(other: QuantityUnit): boolean {
    return (
      this.code === other.code &&
      this.system === other.system &&
      this.unit === other.unit
    )
  }

  fhirQuantity(value: number): Quantity {
    return {
      system: this.system,
      code: this.code,
      value: value,
      unit: this.unit,
    }
  }

  valueOf(quantity: Quantity | undefined): number | undefined {
    if (!quantity?.value) return undefined
    if (this.isUsedIn(quantity)) return quantity.value
    return undefined
  }
}