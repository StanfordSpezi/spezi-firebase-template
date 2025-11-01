import { type Observation, type QuestionnaireResponse } from "fhir/r4b.js";
import { z } from "zod";
import { FHIRObservation } from "./fhirObservation.js";
import { FHIRQuestionnaireResponse } from "./fhirQuestionnaireResponse.js";
import { SchemaConverter } from "../helpers/schemaConverter.js";

export const fhirObservationConverter = new SchemaConverter({
  schema: z
    .unknown()
    .transform(
      (data) => new FHIRObservation(data as Observation),
    ) as z.ZodSchema<FHIRObservation>,
  encode: (observation: FHIRObservation) => observation.raw(),
});

export const fhirQuestionnaireResponseConverter = new SchemaConverter({
  schema: z
    .unknown()
    .transform(
      (data) => new FHIRQuestionnaireResponse(data as QuestionnaireResponse),
    ) as z.ZodSchema<FHIRQuestionnaireResponse>,
  encode: (response: FHIRQuestionnaireResponse) => response.raw(),
});
