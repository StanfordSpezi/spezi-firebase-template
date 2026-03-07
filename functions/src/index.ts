// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import admin from "firebase-admin";

admin.initializeApp();

export { addStepCount } from "./functions/addStepCount.js";
export { getUserData } from "./functions/getUserData.js";
export { onUserCreated } from "./functions/onUserCreated.js";
export { dismissMessage } from "./functions/dismissMessage.js";
export { registerDevice } from "./functions/registerDevice.js";
export { unregisterDevice } from "./functions/unregisterDevice.js";
