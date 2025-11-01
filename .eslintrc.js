module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    "prettier/prettier": "warn",
    "template-curly-spacing": ["warn", "never"],
    "object-curly-spacing": ["warn", "always"],
    "block-spacing": ["warn", "always"],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars":
      process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-unsafe-argument": "warn",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
  },
  ignorePatterns: ["dist/", "node_modules/"],
};
