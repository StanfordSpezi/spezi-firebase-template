//
// Based on Stanford Biodesign Digital Health Spezi Web Configurations
// Adapted for Firebase Functions Models
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
// SPDX-License-Identifier: MIT
//

import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Completely ignore these directories
  {
    ignores: ["lib/**/*", "node_modules/**/*", "dist/**/*"],
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
        // Add fhir4 global namespace to prevent ESLint errors
        fhir4: "readonly",
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
    },
  },
);