import { UserAuth, type User } from "@stanfordbdhg/spezi-firebase-models";
import { getAuth } from "firebase-admin/auth";
import { type UserService } from "./userService.js";
import { CollectionsService } from "../database/collections.js";
import {
  type DatabaseService,
  type Document,
} from "../database/databaseService.js";

export class DefaultUserService implements UserService {
  private databaseService: DatabaseService;
  private collections: CollectionsService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
    this.collections = new CollectionsService(databaseService.firestore());
  }

  async getAuth(userId: string): Promise<UserAuth> {
    const userRecord = await getAuth().getUser(userId);
    return new UserAuth({
      displayName: userRecord.displayName,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      phoneNumber: userRecord.phoneNumber,
      customClaims: userRecord.customClaims,
    });
  }

  async updateAuth(userId: string, auth: Partial<UserAuth>): Promise<void> {
    const updateRequest: {
      displayName?: string;
      email?: string;
      emailVerified?: boolean;
      disabled?: boolean;
      phoneNumber?: string;
    } = {};
    if (auth.displayName !== undefined)
      updateRequest.displayName = auth.displayName;
    if (auth.email !== undefined) updateRequest.email = auth.email;
    if (auth.emailVerified !== undefined)
      updateRequest.emailVerified = auth.emailVerified;
    if (auth.disabled !== undefined) updateRequest.disabled = auth.disabled;
    if (auth.phoneNumber !== undefined)
      updateRequest.phoneNumber = auth.phoneNumber;

    await getAuth().updateUser(userId, updateRequest);

    if (auth.customClaims !== undefined) {
      await getAuth().setCustomUserClaims(userId, auth.customClaims);
    }
  }

  async getUser(userId: string): Promise<Document<User> | undefined> {
    const userDoc = await this.collections.users.doc(userId).get();
    const data = userDoc.data() as User | undefined;
    return data ? { id: userDoc.id, data } : undefined;
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete from Firebase Auth
    await getAuth().deleteUser(userId);

    // Delete user document and subcollections
    const batch = this.databaseService.firestore().batch();

    // Delete user document
    const userRef = this.collections.users.doc(userId);
    batch.delete(userRef);

    // Delete all subcollections
    const subcollections = [
      "stepCount",
      "bodyWeight",
      "heartRate",
      "questionnaireResponses",
      "messages",
    ];

    for (const collection of subcollections) {
      const collectionRef = userRef.collection(collection);
      const docs = await collectionRef.get();
      docs.docs.forEach((doc) => batch.delete(doc.ref));
    }

    await batch.commit();
  }

  async disableUser(userId: string): Promise<void> {
    await getAuth().updateUser(userId, { disabled: true });
    await this.collections.users.doc(userId).update({ disabled: true });
  }

  async enableUser(userId: string): Promise<void> {
    await getAuth().updateUser(userId, { disabled: false });
    await this.collections.users.doc(userId).update({ disabled: false });
  }

  async updateUserInfo(userId: string, data: Partial<User>): Promise<void> {
    const updateData: {
      displayName?: string;
      email?: string;
      organization?: string;
      clinician?: string;
      language?: string;
      timeZone?: string;
    } = {};
    if (data.displayName !== undefined)
      updateData.displayName = data.displayName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.organization !== undefined)
      updateData.organization = data.organization;
    if (data.clinician !== undefined) updateData.clinician = data.clinician;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.timeZone !== undefined) updateData.timeZone = data.timeZone;

    if (Object.keys(updateData).length > 0) {
      await this.collections.users.doc(userId).update(updateData);
    }
  }

  async getAllUsers(): Promise<Array<Document<User>>> {
    const querySnapshot = await this.collections.users.get();
    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data() as User | undefined;
        return data ? { id: doc.id, data } : undefined;
      })
      .filter((doc): doc is Document<User> => doc !== undefined);
  }
}
