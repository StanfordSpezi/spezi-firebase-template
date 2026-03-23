// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2025, 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { createRequire } from "module";
import { dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const {
  getEslintNodeConfig,
} = require("@stanfordspezi/spezi-web-configurations");

export default [
  ...getEslintNodeConfig({ tsconfigRootDir: __dirname }),
  {
    ignores: [
      "functions/lib/",
      "models/",
      "eslint.config.mjs",
      ".prettierrc.js",
      "functions/eslint.config.mjs",
      "functions/seed.mjs",
      "functions/serve-seeded.mjs",
      "functions/vitest.config.ts",
      "functions/src/tests/",
    ],
  },
];
