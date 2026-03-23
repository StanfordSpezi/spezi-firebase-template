// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2025, 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const {
  getEslintNodeConfig,
} = require("@stanfordspezi/spezi-web-configurations");

module.exports = [
  ...getEslintNodeConfig({ tsconfigRootDir: __dirname }),
  {
    ignores: [
      "functions/lib/",
      "models/lib/",
      "functions/eslint.config.mjs",
      "functions/seed.mjs",
      "functions/serve-seeded.mjs",
      "functions/vitest.config.ts",
      "functions/src/tests/",
    ],
  },
];
