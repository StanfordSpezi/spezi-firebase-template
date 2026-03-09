import admin from "firebase-admin";

const AUTH_EMULATOR_HOST = "127.0.0.1:9099";

interface TestUser {
  uid: string;
  token: string;
}

export async function createTestUser(options: {
  email?: string;
  password?: string;
  uid?: string;
  customClaims?: Record<string, unknown>;
}): Promise<TestUser> {
  const email = options.email ?? `test-${Date.now()}@example.com`;
  const password = options.password ?? "testpassword123";

  const userRecord = await admin.auth().createUser({
    uid: options.uid,
    email,
    password,
  });

  if (options.customClaims) {
    await admin.auth().setCustomUserClaims(userRecord.uid, options.customClaims);
  }

  // Sign in via Auth emulator REST API to get an ID token
  const signInResponse = await fetch(
    `http://${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );

  const signInData = (await signInResponse.json()) as { idToken: string };
  return { uid: userRecord.uid, token: signInData.idToken };
}
