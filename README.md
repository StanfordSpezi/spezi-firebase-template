<!--
This source file is part of the Stanford Spezi Firebase Template project

SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
SPDX-License-Identifier: MIT
-->

# Spezi Firebase Template

A Firebase template for healthcare applications using the Spezi framework with FHIR support.

## Features

- **User Management**: Patient, Clinician, and Owner user types
- **FHIR Support**: Built-in FHIR R4B observation and questionnaire response handling
- **Health Data**: Step count tracking as an example use case
- **Messaging System**: User notifications and messaging functionality
- **Internationalisation**: Language and timezone support for international deployment
- **Firebase Features used**: Firestore, Authentication, Cloud Functions, and Storage
- **TypeScript**: Fully typed with strict type checking

## Quick Start

### Prerequisites

- Node.js 18 or later
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project

### Setup

1. **Clone and install dependencies:**
   ```bash
   cd spezi-firebase-template
   npm run install
   ```

2. **Initialize Firebase:**
   ```bash
   firebase login
   firebase use --add  # Select your Firebase project
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Start the emulator:**
   ```bash
   firebase emulators:start
   ```

5. **Deploy (when ready):**
   ```bash
   firebase deploy
   ```

## Architecture

### User Types

- **Patient**: Can track their own health data (step count, questionnaire responses)
- **Clinician**: Can view patient data they're assigned to
- **Owner**: Full administrative access to all data

### Data Structure

```
users/{userId}
├── (user document)
├── stepCount/{observationId}           # FHIR Observations
├── bodyWeight/{observationId}          # FHIR Observations  
├── heartRate/{observationId}           # FHIR Observations
├── questionnaireResponses/{responseId} # FHIR QuestionnaireResponses
└── messages/{messageId}                # User messages/notifications
```

### FHIR Integration

The template uses FHIR R4B resources for health data:

- **Observations**: Step count, body weight, heart rate
- **QuestionnaireResponses**: Survey/questionnaire data

Example step count observation:
```typescript
import { observationSchema } from '@stanfordspezi/spezi-firebase-fhir'

const observation: fhir4b.Observation = {
  resourceType: 'Observation',
  id: 'unique-id',
  status: 'final',
  code: {
    text: 'Number of steps in 24 hour Measured',
    coding: [{
      system: 'http://loinc.org',
      code: '55423-8',
      display: 'Number of steps in 24 hour Measured'
    }]
  },
  valueQuantity: {
    value: 10000,
    unit: 'steps',
    system: 'http://unitsofmeasure.org',
    code: '{steps}'
  },
  effectiveDateTime: new Date().toISOString()
}

const validatedObservation = observationSchema.parse(observation)
```

## Available Functions

### `addStepCount`
Add step count data for authenticated user.

**Parameters:**
```typescript
{
  date: string;    // ISO date string
  steps: number;   // Number of steps (>= 0)
}
```

### `getUserData`
Get user profile and recent step count data (last 30 days).

**Returns:**
```typescript
{
  user: {
    type: UserType;
    displayName?: string;
    email?: string;
    createdAt: Date;
    lastActiveDate: Date;
  };
  stepCountData: Array<{
    id: string;
    date: string;
    steps: number;
  }>;
}
```

### `dismissMessage`
Dismiss a user message/notification.

**Parameters:**
```typescript
{
  messageId: string;
  didPerformAction?: boolean;
}
```

### `getUsersInformation` (Owner/Clinician only)
Get information about multiple users, including authentication and user data.

**Parameters:**
```typescript
{
  userIds: string[];
  includeUserData?: boolean; // defaults to true
}
```

**Returns:**
```typescript
Record<string, {
  data?: {
    auth: UserAuth;
    user?: User;
  };
  error?: {
    code: string;
    message: string;
  };
}>
```

### `deleteUser` (Owner/Clinician only)
Permanently delete a user and all their associated data.

**Parameters:**
```typescript
{
  userId: string;
}
```

### `updateUserInformation`
Update user authentication and profile information. Users can update their own data, while owners/clinicians can update any user's data.

**Parameters:**
```typescript
{
  userId: string;
  data: {
    auth?: {
      displayName?: string;
      email?: string;
      disabled?: boolean;
      phoneNumber?: string;
    };
    user?: {
      type?: UserType;
      organization?: string;
      clinician?: string;
      displayName?: string;
      email?: string;
      language?: string;
      timeZone?: string;
    };
  };
}
```

## Localization

The template includes built-in support for internationalization:

### Language and Timezone Support

Users can set their preferred language and timezone:

```typescript
await updateUserInformation('userId', {
  data: {
    user: {
      language: 'en-US',
      timeZone: 'America/New_York'
    }
  }
})
```

### Usage in Your Application

```typescript
// Get user data including localization preferences
const userData = await getUserData()
const userLanguage = userData.user.language || 'en-US'
const userTimeZone = userData.user.timeZone || 'UTC'

// Format dates according to user preferences
const formatter = new Intl.DateTimeFormat(userLanguage, {
  timeZone: userTimeZone,
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
```

## Security

The template includes comprehensive security rules:

- Users can only access their own data
- Clinicians can read patient data
- Owners have administrative access
- Proper authentication is required for all operations

## Customization

### Adding New Observation Types

1. Add collection type to `UserObservationCollection` in `functions/src/types/index.ts`
2. Create a new Firebase Function following the pattern in `addStepCount.ts`:
   - Use Zod schema for input validation
   - Create a FHIR R4B Observation with appropriate LOINC codes and units
   - Validate with `observationSchema.parse()` from `@stanfordspezi/spezi-firebase-fhir`
3. Update Firestore security rules if needed

### Adding New User Message Types

1. Extend `UserMessageType` enum in `functions/src/types/index.ts`
2. Create functions to send new message types
3. Update client-side message handling

### Extending User Model

1. Modify the `User` class and `userConverter` in `functions/src/types/index.ts`
2. Update security rules if needed

## Development

### Scripts

- `npm run build` - Build all packages
- `npm run lint` - Lint all code
- `npm run lint:fix` - Fix linting issues
- `npm run clean` - Clean build artifacts
- `npm test:ci` - Run tests with emulators

### Project Structure

```
spezi-firebase-template/
├── functions/
│   └── src/                    # Firebase Functions source
│       ├── functions/          # Cloud Functions
│       ├── services/           # Business logic services
│       └── types/              # TypeScript types and converters
├── firebase.json               # Firebase configuration
├── firestore.rules            # Firestore security rules
└── firebasestorage.rules      # Storage security rules
```

## Contributing

This template is designed to be a starting point. Feel free to:

- Add more FHIR resource types
- Implement additional health tracking features
- Enhance the messaging system
- Add more sophisticated user management

## License

MIT License - see LICENSE file for details.