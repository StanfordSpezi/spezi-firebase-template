// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2024, 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const {
  getEslintNodeConfig,
} = require("@stanfordspezi/spezi-web-configurations");

export default [
  ...getEslintNodeConfig({ tsconfigRootDir: import.meta.dirname }),
  {
    ignores: [
      "lib/**/*",
      "node_modules/**/*",
      "models/**/*",
      "dist/**/*",
      "eslint.config.mjs",
      "serve-seeded.mjs",
      "src/tests/**/*",
      "vitest.config.ts",
    ],
  },
  // Firebase-specific overrides
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  },
];