import { z } from 'zod'
import { validatedOnCall } from '../helpers/validatedOnCall.js'
import { Credential } from '../services/auth/credential.js'
import { DefaultUserService } from '../services/user/defaultUserService.js'
import { DefaultDatabaseService } from '../services/database/databaseService.js'
import { getFirestore } from 'firebase-admin/firestore'
import { UserType } from '@stanfordbdhg/spezi-firebase-models'

const updateUserInformationInputSchema = z.object({
  userId: z.string(),
  data: z.object({
    auth: z.object({
      displayName: z.string().optional(),
      email: z.string().email().optional(),
      disabled: z.boolean().optional(),
      phoneNumber: z.string().optional(),
    }).optional(),
    user: z.object({
      type: z.nativeEnum(UserType).optional(),
      organization: z.string().optional(),
      clinician: z.string().optional(),
      displayName: z.string().optional(),
      email: z.string().email().optional(),
    }).optional(),
  }),
})

export const updateUserInformation = validatedOnCall(
  updateUserInformationInputSchema,
  async (request): Promise<{ success: boolean }> => {
    const credential = new Credential(request.auth)
    credential.checkSelfOrOwnerOrClinician(request.data.userId)

    const databaseService = new DefaultDatabaseService(getFirestore())
    const userService = new DefaultUserService(databaseService)

    // Update authentication data
    if (request.data.data.auth) {
      await userService.updateAuth(request.data.userId, request.data.data.auth)
    }

    // Update user document data
    if (request.data.data.user) {
      await userService.updateUserInfo(request.data.userId, request.data.data.user)
    }

    return { success: true }
  },
)