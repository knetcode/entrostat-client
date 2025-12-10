import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "**/spec.ts", "**/spec.json", "lib/**"]),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "func-style": ["error", "declaration", { allowArrowFunctions: false }],
      "no-console": ["warn", { allow: ["error"] }],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": "warn",
      "import/order": "warn",
      "react/no-children-prop": ["warn", { allowFunctions: true }],
    },
  },
]);

export default eslintConfig;
