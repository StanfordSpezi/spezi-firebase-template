// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { z } from 'zod'
import { type Observation, type QuestionnaireResponse } from 'fhir/r4b.js'
import { FHIRObservation } from './fhirObservation.js'
import { FHIRQuestionnaireResponse } from './fhirQuestionnaireResponse.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'

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
