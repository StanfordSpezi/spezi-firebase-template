import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { getFirestore } from 'firebase-admin/firestore'
import { UserMessage, UserMessageType, UserType } from '@stanfordbdhg/spezi-firebase-models'
import { DefaultMessageService } from '../services/message/defaultMessageService.js'
import { DefaultDatabaseService } from '../services/database/databaseService.js'

export const onUserCreated = onDocumentCreated(
  'users/{userId}',
  async (event) => {
    const userId = event.params.userId
    const userData = event.data?.data()

    if (!userData) return

    const databaseService = new DefaultDatabaseService(getFirestore())
    const messageService = new DefaultMessageService(databaseService)

    // Send welcome message based on user type
    let welcomeMessage: UserMessage

    switch (userData.type) {
      case UserType.patient:
        welcomeMessage = new UserMessage({
          type: UserMessageType.info,
          title: 'Welcome to Your Health Journey!',
          description: 'Start tracking your daily steps and health metrics to improve your wellbeing.',
          isDismissed: false,
          didPerformAction: false,
          createdAt: new Date(),
        })
        break
      case UserType.clinician:
        welcomeMessage = new UserMessage({
          type: UserMessageType.info,
          title: 'Welcome, Clinician!',
          description: 'You can now monitor your patients\' health data and provide better care.',
          isDismissed: false,
          didPerformAction: false,
          createdAt: new Date(),
        })
        break
      case UserType.owner:
        welcomeMessage = new UserMessage({
          type: UserMessageType.info,
          title: 'Welcome, Administrator!',
          description: 'You have full access to manage users and monitor the system.',
          isDismissed: false,
          didPerformAction: false,
          createdAt: new Date(),
        })
        break
      default:
        return
    }

    await messageService.addMessage(userId, welcomeMessage, {
      notify: true,
      user: null,
    })
  },
)