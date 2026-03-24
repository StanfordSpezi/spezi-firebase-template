// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { type OrganizationService } from "./organizationService.js";
import { CollectionsService } from "../database/collections.js";
import { type DatabaseService } from "../database/databaseService.js";

export class DefaultOrganizationService implements OrganizationService {
  private collections: CollectionsService;

  constructor(databaseService: DatabaseService) {
    this.collections = new CollectionsService(databaseService.firestore());
  }

  async organizationExists(organizationId: string): Promise<boolean> {
    const doc = await this.collections.organizations.doc(organizationId).get();
    return doc.exists;
  }
}
