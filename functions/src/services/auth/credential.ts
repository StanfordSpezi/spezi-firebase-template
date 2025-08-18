import { UserType } from '@stanfordbdhg/spezi-firebase-models'
import { HttpsError } from 'firebase-functions/v2/https'
import { type AuthData } from 'firebase-functions/v2/https'

export class Credential {
  readonly userId: string
  private readonly claims: any

  constructor(authData: AuthData | undefined) {
    if (authData?.uid === undefined) {
      throw new HttpsError('unauthenticated', 'User is not authenticated.')
    }
    this.userId = authData.uid
    this.claims = authData.token || {}
  }

  checkOwnerOrClinician(): void {
    if (this.claims.disabled === true) {
      throw new HttpsError('permission-denied', 'User is disabled.')
    }
    
    if (this.claims.type !== UserType.owner && this.claims.type !== UserType.clinician) {
      throw new HttpsError('permission-denied', 'User does not have permission.')
    }
  }

  checkSelfOrOwnerOrClinician(targetUserId: string): void {
    if (this.claims.disabled === true) {
      throw new HttpsError('permission-denied', 'User is disabled.')
    }

    // Users can access their own data
    if (this.userId === targetUserId) return

    // Owners and clinicians can access patient data
    if (this.claims.type === UserType.owner || this.claims.type === UserType.clinician) {
      return
    }

    throw new HttpsError('permission-denied', 'User does not have permission.')
  }

  checkAuthenticated(): void {
    if (!this.userId) {
      throw new HttpsError('unauthenticated', 'User is not authenticated.')
    }
    
    if (this.claims.disabled === true) {
      throw new HttpsError('permission-denied', 'User is disabled.')
    }
  }
}