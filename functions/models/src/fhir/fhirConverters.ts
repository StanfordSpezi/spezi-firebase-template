import { z } from "zod";
/// <reference types="fhir" />

type Observation = fhir4.Observation;
type QuestionnaireResponse = fhir4.QuestionnaireResponse;
import { FHIRObservation } from "./fhirObservation.js";
import { FHIRQuestionnaireResponse } from "./fhirQuestionnaireResponse.js";
import { SchemaConverter } from "../helpers/schemaConverter.js";

export const fhirObservationConverter = new SchemaConverter({
  schema: z.any().transform((data: Observation) => new FHIRObservation(data)),
  encode: (observation: FHIRObservation) => observation.raw(),
});

export const fhirQuestionnaireResponseConverter = new SchemaConverter({
  schema: z
    .any()
    .transform(
      (data: QuestionnaireResponse) => new FHIRQuestionnaireResponse(data),
    ),
  encode: (response: FHIRQuestionnaireResponse) => response.raw(),
});
