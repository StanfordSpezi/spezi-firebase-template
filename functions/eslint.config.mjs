// This source file is part of the Stanford Spezi Firebase Template project
//
// SPDX-FileCopyrightText: 2024, 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT

import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Completely ignore these directories
  {
    ignores: ["lib/**/*", "node_modules/**/*", "models/**/*", "dist/**/*"],
  },
  
  // Basic recommended ESLint rules
  eslint.configs.recommended,
  {
    rules: {
      "no-empty-pattern": "off",
    },
  },

  // TypeScript ESLint configuration
  {
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "with-single-extends" },
      ],
      "@typescript-eslint/return-await": ["error", "in-try-catch"],
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        { ignoreArrowShorthand: true },
      ],
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/array-type": [
        "warn",
        { default: "array-simple", readonly: "array-simple" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true, allowBoolean: true },
      ],
      "@typescript-eslint/only-throw-error": "off",
      // Disable explicit any warnings for Firebase functions
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow non-null assertion for Firebase functions
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  },
);