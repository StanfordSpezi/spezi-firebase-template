// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cachePath = join(__dirname, ".emulator-cache");
const accountsPath = join(cachePath, "auth_export", "accounts.json");

let needsSeed = true;
if (existsSync(accountsPath)) {
  try {
    const accounts = JSON.parse(readFileSync(accountsPath, "utf-8"));
    if (accounts.users && accounts.users.length > 0) {
      needsSeed = false;
    }
  } catch {
    needsSeed = true;
  }
}

if (needsSeed) {
  console.log("No seeded data found. Running initial seed...");
  execSync(
    'firebase emulators:exec --only auth,firestore,storage --import=./emulator-data --export-on-exit=./.emulator-cache "node seed.mjs"',
    { stdio: "inherit", cwd: __dirname },
  );
  console.log("Seed complete. Starting emulators with seeded data...\n");
}

execSync(
  "firebase emulators:start --import=./.emulator-cache --export-on-exit=./.emulator-cache",
  { stdio: "inherit", cwd: __dirname },
);
