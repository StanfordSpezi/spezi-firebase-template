// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

const FUNCTIONS_URL =
  "http://127.0.0.1:5001/spezi-firebase-template/us-central1";

interface CallFunctionResult {
  result?: unknown;
  error?: { message: string; status: string };
}

export const callFunction = async (
  name: string,
  data: unknown,
  authToken?: string,
): Promise<CallFunctionResult> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ data }),
  });

  const body = (await response.json()) as CallFunctionResult;
  return body;
};
