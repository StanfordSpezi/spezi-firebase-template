import { z } from 'zod'
import { type Observation, type QuestionnaireResponse } from 'fhir/r4b.js'
import { FHIRObservation } from './fhirObservation.js'
import { FHIRQuestionnaireResponse } from './fhirQuestionnaireResponse.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'

export const fhirObservationConverter = new SchemaConverter({
  schema: z.any().transform((data: Observation) => new FHIRObservation(data)),
  encode: (observation: FHIRObservation) => observation.raw(),
})

export const fhirQuestionnaireResponseConverter = new SchemaConverter({
  schema: z.any().transform((data: QuestionnaireResponse) => new FHIRQuestionnaireResponse(data)),
  encode: (response: FHIRQuestionnaireResponse) => response.raw(),
})