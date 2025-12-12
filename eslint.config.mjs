/** biome-ignore-all lint/correctness/noNodejsModules: <idc> */
/** biome-ignore-all lint/style/useNodejsImportProtocol: <idc> */
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
      "next-env.d.ts",
    ],
  },
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
