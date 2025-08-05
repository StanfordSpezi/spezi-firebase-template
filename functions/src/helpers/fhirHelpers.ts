/// <reference types="fhir" />

type Observation = fhir4b.Observation;
import { observationSchema } from "@stanfordspezi/spezi-firebase-fhir";

export class FHIRHelpers {
  static createStepCountObservation(input: {
    id: string;
    date: Date;
    steps: number;
  }): Observation {
    const observation: Observation = {
      resourceType: "Observation",
      id: input.id,
      status: "final",
      code: {
        text: "Number of steps in 24 hour Measured",
        coding: [
          {
            system: "http://loinc.org",
            code: "55423-8",
            display: "Number of steps in 24 hour Measured",
          },
        ],
      },
      valueQuantity: {
        value: input.steps,
        unit: "steps",
        system: "http://unitsofmeasure.org",
        code: "{steps}",
      },
      effectiveDateTime: input.date.toISOString(),
    };

    return observationSchema.parse(observation);
  }

  static createBodyWeightObservation(input: {
    id: string;
    date: Date;
    weight: number;
    unit: "kg" | "lb";
  }): Observation {
    const unitConfig = input.unit === "kg" 
      ? { unit: "kg", system: "http://unitsofmeasure.org", code: "kg" }
      : { unit: "lb", system: "http://unitsofmeasure.org", code: "[lb_av]" };

    const observation: Observation = {
      resourceType: "Observation",
      id: input.id,
      status: "final",
      code: {
        text: "Body weight",
        coding: [
          {
            system: "http://loinc.org",
            code: "29463-7",
            display: "Body weight",
          },
        ],
      },
      valueQuantity: {
        value: input.weight,
        unit: unitConfig.unit,
        system: unitConfig.system,
        code: unitConfig.code,
      },
      effectiveDateTime: input.date.toISOString(),
    };

    return observationSchema.parse(observation);
  }

  static createHeartRateObservation(input: {
    id: string;
    date: Date;
    bpm: number;
  }): Observation {
    const observation: Observation = {
      resourceType: "Observation",
      id: input.id,
      status: "final",
      code: {
        text: "Heart rate",
        coding: [
          {
            system: "http://loinc.org",
            code: "8867-4",
            display: "Heart rate",
          },
        ],
      },
      valueQuantity: {
        value: input.bpm,
        unit: "beats/min",
        system: "http://unitsofmeasure.org",
        code: "/min",
      },
      effectiveDateTime: input.date.toISOString(),
    };

    return observationSchema.parse(observation);
  }
}