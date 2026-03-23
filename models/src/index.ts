// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

export {
  type UpdatableUserInfo,
  type UserObservationCollection,
  UserMessageType,
  UserType,
  userConverter,
  userAuthConverter,
  userMessageConverter,
  fhirObservationConverter,
  localizedTextConverter,
} from "../../functions/lib/types/index.js";

export {
  addStepCountInputSchema,
  type AddStepCountInput,
  type AddStepCountOutput,
} from "../../functions/lib/functions/addStepCount/schema.js";

export {
  deleteUserInputSchema,
  type DeleteUserInput,
  type DeleteUserOutput,
} from "../../functions/lib/functions/deleteUser/schema.js";

export {
  dismissMessageInputSchema,
  type DismissMessageInput,
  type DismissMessageOutput,
} from "../../functions/lib/functions/dismissMessage/schema.js";

export { type GetUserDataOutput } from "../../functions/lib/functions/getUserData/schema.js";

export {
  getUsersInformationInputSchema,
  type GetUsersInformationInput,
  type GetUsersInformationOutput,
} from "../../functions/lib/functions/getUsersInformation/schema.js";

export {
  updateUserInformationInputSchema,
  type UpdateUserInformationInput,
  type UpdateUserInformationOutput,
} from "../../functions/lib/functions/updateUserInformation/schema.js";
