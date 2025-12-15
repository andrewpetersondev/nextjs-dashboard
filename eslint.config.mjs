/** biome-ignore-all lint/correctness/noNodejsModules: eslint config runs in node */
/** biome-ignore-all lint/style/useNodejsImportProtocol: eslint config runs in node */
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },

  // Alias-focused architectural boundaries (ESLint backup to Biome)
  {
    files: ["src/modules/auth/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules/auth/server/**"],
              message:
                "auth/shared must be isomorphic: do not import from auth/server (alias boundary).",
            },
            {
              group: ["@/server/**"],
              message:
                "auth/shared must be isomorphic: do not import from src/server (alias boundary).",
            },

            // Non-alias guardrails (runtime boundary safety)
            {
              group: ["next/**"],
              message:
                "auth/shared must be isomorphic: do not import Next.js server APIs.",
            },
            {
              group: ["node:*"],
              message:
                "auth/shared must be isomorphic: do not import Node-only APIs.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/modules/auth/server/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules/auth/server/infrastructure/**"],
              message:
                "Clean/hex rule: application layer must not import infrastructure (alias boundary).",
            },
            {
              group: ["@/server/**"],
              message:
                "Clean/hex rule: application layer must not import src/server adapters directly (alias boundary).",
            },

            // Non-alias guardrails (framework/db leak prevention)
            {
              group: ["next/**", "react/**"],
              message:
                "Clean/hex rule: application layer must be framework-agnostic (no next/react imports).",
            },
            {
              group: [
                "drizzle-orm",
                "drizzle-orm/**",
                "drizzle-kit",
                "drizzle-kit/**",
              ],
              message:
                "Clean/hex rule: application layer must not depend on DB libraries directly.",
            },
          ],
        },
      ],
    },
  },

  // Keep your existing project-specific restricted import
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              message:
                "Use LoggingClientContract (logger.operation / logger.errorWithDetails) instead of deprecated auth logging helpers.",
              name: "@/modules/auth/domain/logging/auth-log",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
