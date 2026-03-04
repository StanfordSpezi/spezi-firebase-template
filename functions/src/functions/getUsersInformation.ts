import {
  userAuthConverter,
  userConverter,
} from "@stanfordbdhg/spezi-firebase-models";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import { validatedOnCall } from "../helpers/validatedOnCall.js";
import { Credential } from "../services/auth/credential.js";
import { DefaultDatabaseService } from "../services/database/databaseService.js";
import { DefaultUserService } from "../services/user/defaultUserService.js";

const getUsersInformationInputSchema = z.object({
  userIds: z.array(z.string()),
  includeUserData: z.boolean().optional().default(true),
});

type GetUsersInformationOutput = Record<
  string,
  {
    data?: {
      auth: Record<string, unknown>;
      user?: Record<string, unknown>;
    };
    error?: {
      code: string;
      message: string;
    };
  }
>;

export const getUsersInformation = validatedOnCall(
  getUsersInformationInputSchema,
  async (request): Promise<GetUsersInformationOutput> => {
    const credential = new Credential(request.auth);
    credential.checkOwnerOrClinician();

    const databaseService = new DefaultDatabaseService(getFirestore());
    const userService = new DefaultUserService(databaseService);

    const result: GetUsersInformationOutput = {};

    for (const userId of request.data.userIds) {
      try {
        const authData = await userService.getAuth(userId);
        const userData =
          request.data.includeUserData ?
            await userService.getUser(userId)
          : undefined;

        result[userId] = {
          data: {
            auth: userAuthConverter.encode(authData),
            user: userData ? userConverter.encode(userData.data) : undefined,
          },
        };
      } catch (error) {
        if (error instanceof HttpsError) {
          result[userId] = {
            error: {
              code: error.code,
              message: error.message,
            },
          };
        } else if (error instanceof Error) {
          result[userId] = {
            error: {
              code: "internal",
              message: error.message,
            },
          };
        } else {
          result[userId] = {
            error: {
              code: "internal",
              message: "Internal server error",
            },
          };
        }
      }
    }

    return result;
  },
);
