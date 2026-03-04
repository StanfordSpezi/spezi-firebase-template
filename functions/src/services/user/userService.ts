import { type UserAuth, type User } from "@stanfordbdhg/spezi-firebase-models";
import { type Document } from "../database/databaseService.js";

export interface UserService {
  getAuth(userId: string): Promise<UserAuth>;
  updateAuth(userId: string, auth: Partial<UserAuth>): Promise<void>;
  getUser(userId: string): Promise<Document<User> | undefined>;
  deleteUser(userId: string): Promise<void>;
  disableUser(userId: string): Promise<void>;
  enableUser(userId: string): Promise<void>;
  updateUserInfo(userId: string, data: Partial<User>): Promise<void>;
  getAllUsers(): Promise<Array<Document<User>>>;
}
