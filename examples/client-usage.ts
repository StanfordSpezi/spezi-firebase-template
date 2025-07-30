/**
 * Example client-side usage of the Spezi Firebase Template
 * This would typically be used in your mobile app or web frontend
 */

import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  // Your Firebase config
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const functions = getFunctions(app)

// Example: Adding step count data
async function addStepCount(date: Date, steps: number) {
  const addStepCountFunction = httpsCallable(functions, 'addStepCount')
  
  try {
    const result = await addStepCountFunction({
      date: date.toISOString(),
      steps: steps
    })
    console.log('Step count added:', result.data)
    return result.data
  } catch (error) {
    console.error('Error adding step count:', error)
    throw error
  }
}

// Example: Getting user data
async function getUserData() {
  const getUserDataFunction = httpsCallable(functions, 'getUserData')
  
  try {
    const result = await getUserDataFunction()
    console.log('User data:', result.data)
    return result.data
  } catch (error) {
    console.error('Error getting user data:', error)
    throw error
  }
}

// Example: Dismissing a message
async function dismissMessage(messageId: string, didPerformAction = false) {
  const dismissMessageFunction = httpsCallable(functions, 'dismissMessage')
  
  try {
    const result = await dismissMessageFunction({
      messageId,
      didPerformAction
    })
    console.log('Message dismissed:', result.data)
    return result.data
  } catch (error) {
    console.error('Error dismissing message:', error)
    throw error
  }
}

// Example usage in your app
async function exampleUsage() {
  try {
    // Sign in user
    await signInWithEmailAndPassword(auth, 'user@example.com', 'password')
    
    // Add today's step count
    await addStepCount(new Date(), 8500)
    
    // Get user data including recent step counts
    const userData = await getUserData()
    console.log('Recent step data:', userData.stepCountData)
    
    // Dismiss a message if there are any
    if (userData.messages && userData.messages.length > 0) {
      await dismissMessage(userData.messages[0].id, true)
    }
    
  } catch (error) {
    console.error('Error in example usage:', error)
  }
}

export {
  addStepCount,
  getUserData,
  dismissMessage,
  exampleUsage
}