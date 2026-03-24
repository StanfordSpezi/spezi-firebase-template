// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import admin from "firebase-admin";

admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true });

export { addStepCount } from "./functions/addStepCount/index.js";
export { createUser } from "./functions/createUser/index.js";
export { deleteUser } from "./functions/deleteUser/index.js";
export { getUserData } from "./functions/getUserData/index.js";
export { getUsersInformation } from "./functions/getUsersInformation/index.js";
export { onUserCreated } from "./functions/onUserCreated.js";
export { dismissMessages } from "./functions/dismissMessages/index.js";
export { updateUserInformation } from "./functions/updateUserInformation/index.js";
export { registerDevice } from "./functions/registerDevice.js";
export { unregisterDevice } from "./functions/unregisterDevice.js";
