import { getFirestore } from "firebase-admin/firestore";
import { z } from "zod";
import { validatedOnCall } from "../helpers/validatedOnCall.js";
import { Credential } from "../services/auth/credential.js";
import { DefaultDatabaseService } from "../services/database/databaseService.js";
import { DefaultUserService } from "../services/user/defaultUserService.js";

const deleteUserInputSchema = z.object({
  userId: z.string(),
});

export const deleteUser = validatedOnCall(
  deleteUserInputSchema,
  async (request): Promise<{ success: boolean }> => {
    const credential = new Credential(request.auth);
    credential.checkOwnerOrClinician();

    const databaseService = new DefaultDatabaseService(getFirestore());
    const userService = new DefaultUserService(databaseService);

    await userService.deleteUser(request.data.userId);

    return { success: true };
  },
);
