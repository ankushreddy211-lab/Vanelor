/**
 * Shared ESLint preset. The one rule that matters most here is `boundaries`:
 * architecture §5 says a `features/` folder may import from packages/domain,
 * packages/db, packages/contracts, and lib/ — but NOT from another feature
 * directly. That rule is what keeps the modular monolith modular as the
 * team grows past the people who remember the architecture doc by heart.
 *
 * Kept intentionally small for Phase 3 — `features/` doesn't exist as a
 * folder yet (that's Phase 6+ as domains get built), so the boundaries
 * element config below is a placeholder ready to be filled in once there's
 * something to enforce. Strict TS rules are live now.
 */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "boundaries"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/consistent-type-imports": "error",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
  settings: {
    "boundaries/elements": [
      { type: "feature", pattern: "features/*" },
      { type: "domain", pattern: "packages/domain/*" },
      { type: "lib", pattern: "lib/*" },
    ],
  },
};
