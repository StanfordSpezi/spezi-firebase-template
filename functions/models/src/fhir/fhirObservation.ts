/// <reference types="fhir" />

type Observation = fhir4.Observation;
import { FHIRResource } from "./fhirResource.js";
import { CodingSystem, LoincCode } from "../codes/codes.js";
import { QuantityUnit } from "../codes/quantityUnit.js";
import { type ObservationQuantity } from "../types/observationQuantity.js";

export class FHIRObservation extends FHIRResource<Observation> {
  private static readonly loincDisplay = new Map<LoincCode, string>([
    [LoincCode.stepCount, "Number of steps in 24 hour Measured"],
    [LoincCode.bodyWeight, "Body weight"],
    [LoincCode.heartRate, "Heart rate"],
  ]);

  static createStepCount(input: {
    id: string;
    date: Date;
    steps: number;
  }): FHIRObservation {
    return new FHIRObservation({
      resourceType: "Observation",
      id: input.id,
      status: "final",
      code: {
        text: this.loincDisplay.get(LoincCode.stepCount),
        coding: [
          {
            system: CodingSystem.loinc,
            code: LoincCode.stepCount,
            display: this.loincDisplay.get(LoincCode.stepCount),
          },
        ],
      },
      valueQuantity: {
        value: input.steps,
        unit: QuantityUnit.steps.unit,
        system: QuantityUnit.steps.system,
        code: QuantityUnit.steps.code,
      },
      effectiveDateTime: input.date.toISOString(),
    });
  }

  static createSimple(input: {
    id: string;
    date: Date;
    value: number;
    unit: QuantityUnit;
    code: LoincCode;
  }): FHIRObservation {
    return new FHIRObservation({
      resourceType: "Observation",
      id: input.id,
      status: "final",
      code: {
        text: this.loincDisplay.get(input.code) ?? undefined,
        coding: [
          {
            system: CodingSystem.loinc,
            code: input.code,
            display: this.loincDisplay.get(input.code) ?? undefined,
          },
        ],
      },
      valueQuantity: {
        value: input.value,
        unit: input.unit.unit,
        system: input.unit.system,
        code: input.unit.code,
      },
      effectiveDateTime: input.date.toISOString(),
    });
  }

  get stepCount(): ObservationQuantity | undefined {
    return this.observationQuantities({
      code: LoincCode.stepCount,
      system: CodingSystem.loinc,
      unit: QuantityUnit.steps,
    }).at(0);
  }

  bodyWeight(unit: QuantityUnit): ObservationQuantity | undefined {
    return this.observationQuantities({
      code: LoincCode.bodyWeight,
      system: CodingSystem.loinc,
      unit: unit,
    }).at(0);
  }

  get heartRate(): ObservationQuantity | undefined {
    return this.observationQuantities({
      code: LoincCode.heartRate,
      system: CodingSystem.loinc,
      unit: QuantityUnit.bpm,
    }).at(0);
  }

  private observationQuantities(options: {
    code: string;
    system: string;
    unit: QuantityUnit;
  }): ObservationQuantity[] {
    const result: ObservationQuantity[] = [];
    if (!this.containsCoding(this.data.code, [options])) return result;
    const date =
      this.data.effectiveDateTime ??
      this.data.effectiveInstant ??
      this.data.effectivePeriod?.start ??
      this.data.effectivePeriod?.end;
    if (!date) return result;

    const value = options.unit.valueOf(this.data.valueQuantity);
    if (!value) return result;
    result.push({ date: new Date(date), value: value, unit: options.unit });
    return result;
  }
}
