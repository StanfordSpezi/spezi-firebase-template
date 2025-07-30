import admin from 'firebase-admin'

admin.initializeApp()

export { addStepCount } from './functions/addStepCount.js'
export { getUserData } from './functions/getUserData.js'
export { onUserCreated } from './functions/onUserCreated.js'
export { dismissMessage } from './functions/dismissMessage.js'