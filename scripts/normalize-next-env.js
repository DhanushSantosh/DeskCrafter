const { existsSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const target = process.argv[2];

if (!target) {
  console.error("Usage: node scripts/normalize-next-env.js <app-path>");
  process.exit(1);
}

const repoRoot = path.resolve(__dirname, "..");
const filePath = path.join(repoRoot, target, "next-env.d.ts");

if (!existsSync(filePath)) {
  console.error(`next-env.d.ts not found for ${target}`);
  process.exit(1);
}

const stableContent = [
  '/// <reference types="next" />',
  '/// <reference types="next/image-types/global" />',
  'import "./.next/dev/types/routes.d.ts";',
  "",
  "// NOTE: This file should not be edited",
  "// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.",
  "",
].join("\n");

writeFileSync(filePath, stableContent, "utf8");
