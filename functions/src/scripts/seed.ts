// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { CollectionsService } from "../services/database/collections.js";
import {
  type CustomClaims,
  Organization,
  User,
  UserMessage,
  UserMessageType,
  UserType,
} from "../types/index.js";

interface SeedAuth {
  uid: string;
  email: string;
  password: string;
  displayName: string;
}

interface SeedMessage {
  id: string;
  data: UserMessage;
}

interface SeedUser {
  auth: SeedAuth;
  user: User;
  messages?: SeedMessage[];
}

interface SeedOrganization {
  id: string;
  data: Organization;
}

const organizations: SeedOrganization[] = [
  {
    id: "org-stanford-health",
    data: new Organization({ name: "Stanford Health" }),
  },
  {
    id: "org-test-clinic",
    data: new Organization({ name: "Test Clinic" }),
  },
];

const defaultPassword = 'test1234'

const users: SeedUser[] = [
  {
    auth: {
      uid: "admin-user-1",
      email: "admin@example.com",
      password: defaultPassword,
      displayName: "Admin User",
    },
    user: new User({
      type: UserType.admin,
      disabled: false,
      displayName: "Admin User",
      email: "admin@example.com",
      phoneNumbers: [],
      language: "en",
      timeZone: "America/Los_Angeles",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      lastActiveDate: new Date("2026-03-24T00:00:00.000Z"),
    }),
    messages: [
      {
        id: "msg-welcome",
        data: new UserMessage({
          type: UserMessageType.welcome,
          title: "Welcome, Administrator!",
          description:
            "You have full access to manage users and monitor the system.",
          createdAt: new Date("2026-01-01T00:05:00.000Z"),
        }),
      },
    ],
  },
  {
    auth: {
      uid: "owner-user-1",
      email: "owner@example.com",
      password: defaultPassword,
      displayName: "Alice Owner",
    },
    user: new User({
      type: UserType.owner,
      disabled: false,
      displayName: "Alice Owner",
      email: "owner@example.com",
      organization: "org-stanford-health",
      phoneNumbers: [],
      language: "en",
      timeZone: "America/Los_Angeles",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      lastActiveDate: new Date("2026-03-24T00:00:00.000Z"),
    }),
    messages: [
      {
        id: "msg-welcome",
        data: new UserMessage({
          type: UserMessageType.welcome,
          title: "Welcome, Administrator!",
          description:
            "You have full access to manage users and monitor the system.",
          createdAt: new Date("2026-01-01T00:05:00.000Z"),
        }),
      },
    ],
  },
  {
    auth: {
      uid: "clinician-user-1",
      email: "clinician@example.com",
      password: defaultPassword,
      displayName: "Bob Clinician",
    },
    user: new User({
      type: UserType.clinician,
      disabled: false,
      displayName: "Bob Clinician",
      email: "clinician@example.com",
      organization: "org-stanford-health",
      phoneNumbers: [],
      language: "en",
      timeZone: "America/Los_Angeles",
      createdAt: new Date("2026-01-15T00:00:00.000Z"),
      lastActiveDate: new Date("2026-03-24T00:00:00.000Z"),
    }),
    messages: [
      {
        id: "msg-welcome",
        data: new UserMessage({
          type: UserMessageType.welcome,
          title: "Welcome, Clinician!",
          description:
            "You can now monitor your patients' health data and provide better care.",
          createdAt: new Date("2026-01-15T00:05:00.000Z"),
        }),
      },
    ],
  },
  {
    auth: {
      uid: "patient-user-1",
      email: "patient@example.com",
      password: defaultPassword,
      displayName: "Carol Patient",
    },
    user: new User({
      type: UserType.patient,
      disabled: false,
      displayName: "Carol Patient",
      email: "patient@example.com",
      organization: "org-stanford-health",
      clinician: "clinician-user-1",
      phoneNumbers: [],
      language: "en",
      timeZone: "America/New_York",
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
      lastActiveDate: new Date("2026-03-24T00:00:00.000Z"),
    }),
    messages: [
      {
        id: "msg-welcome",
        data: new UserMessage({
          type: UserMessageType.welcome,
          title: "Welcome to Your Health Journey!",
          description:
            "Start tracking your daily steps and health metrics to improve your wellbeing.",
          createdAt: new Date("2026-02-01T00:05:00.000Z"),
        }),
      },
    ],
  },
];

const seed = async (): Promise<void> => {
  if (
    !process.env.FIREBASE_AUTH_EMULATOR_HOST ||
    !process.env.FIRESTORE_EMULATOR_HOST
  ) {
    console.error(
      "ERROR: Emulator environment variables not set. " +
        "This script must only run against Firebase emulators. " +
        "Set FIREBASE_AUTH_EMULATOR_HOST and FIRESTORE_EMULATOR_HOST or use 'firebase emulators:exec'.",
    );
    process.exit(1);
  }

  const app = initializeApp({ projectId: "spezi-firebase-template" });
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  firestore.settings({ ignoreUndefinedProperties: true });
  const collections = new CollectionsService(firestore);

  for (const org of organizations) {
    const orgDoc = collections.organizations.doc(org.id);
    const existing = await orgDoc.get();
    if (!existing.exists) {
      await orgDoc.set(org.data);
      console.log(`Created organization: ${org.id}`);
    } else {
      console.log(`Organization already exists: ${org.id}`);
    }
  }

  let messageCount = 0;
  for (const { auth: authData, user: userData, messages } of users) {
    try {
      await auth.createUser({
        uid: authData.uid,
        email: authData.email,
        password: authData.password,
        displayName: authData.displayName,
      });
      console.log(`Created auth user: ${authData.email}`);
    } catch (error) {
      if ((error as { code?: string }).code === "auth/uid-already-exists") {
        console.log(`Auth user already exists: ${authData.email}`);
      } else {
        throw error;
      }
    }

    const claims: CustomClaims = { type: userData.type };
    if (userData.organization !== undefined) {
      claims.organization = userData.organization;
    }
    await auth.setCustomUserClaims(authData.uid, claims);
    console.log(`Set custom claims for: ${authData.email}`);

    const userDoc = collections.users.doc(authData.uid);
    const existing = await userDoc.get();
    if (!existing.exists) {
      await userDoc.set(userData);
      console.log(`Created Firestore user doc: ${authData.uid}`);
    } else {
      console.log(`Firestore user doc already exists: ${authData.uid}`);
    }

    if (messages) {
      const messagesCollection = collections.userMessages(authData.uid);
      for (const message of messages) {
        const messageDoc = messagesCollection.doc(message.id);
        const existingMessage = await messageDoc.get();
        if (!existingMessage.exists) {
          await messageDoc.set(message.data);
          console.log(`Created message ${message.id} for: ${authData.email}`);
          messageCount++;
        } else {
          console.log(
            `Message ${message.id} already exists for: ${authData.email}`,
          );
        }
      }
    }
  }

  console.log(
    `Seeding complete: ${organizations.length} organizations, ${users.length} users, ${messageCount} messages processed.`,
  );
};

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
