import { logger } from "firebase-functions/v2";
import {
  onCall,
  type CallableRequest,
  HttpsError,
  type CallableOptions,
} from "firebase-functions/v2/https";
import { z, type ZodType } from "zod";

export const validatedOnCall = <Schema extends ZodType, Return>(
  schema: Schema,
  handler: (request: CallableRequest<z.output<Schema>>) => Promise<Return>,
  options: CallableOptions = {},
) =>
  onCall(
    {
      cors: true,
      ...options,
    },
    async (request) => {
      try {
        const validatedRequest = request as CallableRequest<z.output<Schema>>;
        validatedRequest.data = schema.parse(request.data);
        return await handler(validatedRequest);
      } catch (error) {
        logger.error("Function error:", error);
        if (error instanceof z.ZodError) {
          throw new HttpsError(
            "invalid-argument",
            "Invalid request data",
            error.issues,
          );
        }
        throw error;
      }
    },
  );
