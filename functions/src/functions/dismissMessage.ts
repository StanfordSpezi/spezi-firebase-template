import { onCall, type CallableRequest, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import { DefaultMessageService } from '../services/message/defaultMessageService.js'
import { DefaultDatabaseService } from '../services/database/databaseService.js'

interface DismissMessageData {
  messageId: string
  didPerformAction?: boolean
}

export const dismissMessage = onCall(
  { cors: true },
  async (request: CallableRequest<DismissMessageData>) => {
    const { auth, data } = request

    if (!auth) {
      throw new HttpsError('unauthenticated', 'Authentication required')
    }

    if (!data.messageId) {
      throw new HttpsError('invalid-argument', 'Message ID is required')
    }

    try {
      const userId = auth.uid
      const databaseService = new DefaultDatabaseService(getFirestore())
      const messageService = new DefaultMessageService(databaseService)

      await messageService.dismissMessage(
        userId,
        data.messageId,
        data.didPerformAction ?? false,
      )

      return { success: true }
    } catch (error) {
      console.error('Error dismissing message:', error)
      throw new HttpsError('internal', 'Failed to dismiss message')
    }
  },
)