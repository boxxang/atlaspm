import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Prisma client — vendor output, not source.
    "src/generated/**",
    // Node scripts that build the activity library. Not app source, and not
    // ESM: they are run with `node tools/...`, where `require` is the idiom.
    "tools/**",
  ]),
  {
    rules: {
      // `const { attachments: _a, ...rest } = row` is how a field is dropped;
      // the binding it needs is not an unused variable.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
]);

export default eslintConfig;
