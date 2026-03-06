// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { z } from 'zod'
import { UserType } from './userType.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'

export const userConverter = new SchemaConverter({
  schema: z.object({
    type: z.nativeEnum(UserType),
    disabled: z.boolean().default(false),
    organization: z.string().optional(),
    clinician: z.string().optional(),
    displayName: z.string().optional(),
    email: z.string().email().optional(),
    phoneNumbers: z.array(z.string()).default([]),
    language: z.string().optional(),
    timeZone: z.string().optional(),
    createdAt: z.date(),
    lastActiveDate: z.date(),
  }).transform((values) => new User(values)),
  encode: (object) => ({
    type: object.type,
    disabled: object.disabled,
    organization: object.organization,
    clinician: object.clinician,
    displayName: object.displayName,
    email: object.email,
    phoneNumbers: object.phoneNumbers,
    language: object.language,
    timeZone: object.timeZone,
    createdAt: object.createdAt,
    lastActiveDate: object.lastActiveDate,
  }),
})

export class User {
  readonly type: UserType
  readonly disabled: boolean
  readonly organization?: string
  readonly clinician?: string
  readonly displayName?: string
  readonly email?: string
  readonly phoneNumbers: string[]
  readonly language?: string
  readonly timeZone?: string
  readonly createdAt: Date
  readonly lastActiveDate: Date

  constructor(input: {
    type: UserType
    disabled: boolean
    organization?: string
    clinician?: string
    displayName?: string
    email?: string
    phoneNumbers: string[]
    language?: string
    timeZone?: string
    createdAt: Date
    lastActiveDate: Date
  }) {
    this.type = input.type
    this.disabled = input.disabled
    this.organization = input.organization
    this.clinician = input.clinician
    this.displayName = input.displayName
    this.email = input.email
    this.phoneNumbers = input.phoneNumbers
    this.language = input.language
    this.timeZone = input.timeZone
    this.createdAt = input.createdAt
    this.lastActiveDate = input.lastActiveDate
  }
}