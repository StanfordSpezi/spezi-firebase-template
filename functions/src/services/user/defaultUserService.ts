// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { getAuth } from "firebase-admin/auth";
import { type UserService } from "./userService.js";
import {
  UserAuth,
  type UpdatableUserInfo,
  type User,
  type UserType,
} from "../../types/index.js";
import { CollectionsService } from "../database/collections.js";
import {
  type DatabaseService,
  type Document,
  convertDocument,
} from "../database/databaseService.js";

export class DefaultUserService implements UserService {
  private databaseService: DatabaseService;
  private collections: CollectionsService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
    this.collections = new CollectionsService(databaseService.firestore());
  }

  async createUser(data: {
    auth: Partial<UserAuth>;
    user: Partial<User> & Pick<User, "type">;
  }): Promise<string> {
    const userRecord = await getAuth().createUser(data.auth);
    if (data.auth.customClaims) {
      await getAuth().setCustomUserClaims(
        userRecord.uid,
        data.auth.customClaims,
      );
    }

    await this.collections.users.doc(userRecord.uid).set({
      disabled: false,
      phoneNumbers: [],
      createdAt: new Date(),
      lastActiveDate: new Date(),
      ...data.user,
    });

    return userRecord.uid;
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
    return convertDocument(userDoc);
  }

  async deleteUser(userId: string): Promise<void> {
    const userRef = this.collections.users.doc(userId);

    // Delete user document and all subcollections recursively first
    // to avoid orphaned Firestore data if Auth deletion succeeds but Firestore fails
    await this.databaseService.firestore().recursiveDelete(userRef);

    // Delete from Firebase Auth
    await getAuth().deleteUser(userId);
  }

  async disableUser(userId: string): Promise<void> {
    await getAuth().updateUser(userId, { disabled: true });
    await this.collections.users.doc(userId).update({ disabled: true });
  }

  async enableUser(userId: string): Promise<void> {
    await getAuth().updateUser(userId, { disabled: false });
    await this.collections.users.doc(userId).update({ disabled: false });
  }

  async updateUserInfo(
    userId: string,
    data: Partial<UpdatableUserInfo>,
  ): Promise<void> {
    const updateData: {
      type?: UserType;
      displayName?: string;
      email?: string;
      organization?: string;
      clinician?: string;
      language?: string;
      timeZone?: string;
    } = {};
    if (data.type !== undefined) updateData.type = data.type;
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
    return querySnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
  }
}
