/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  trailingComma: "es5",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  singleAttributePerLine: false,
  endOfLine: "lf",
  insertPragma: false,
  requirePragma: false,
  printWidth: 150,
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
