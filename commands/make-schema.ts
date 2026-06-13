/**
 * Create a new DB schema.
 * Usage: bun run make:schema <schema-name>
 * Example: bun run make:schema products
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, openSync, closeSync } from "node:fs";
import { join, resolve } from "node:path";

const SCHEMAS_DIR = resolve("apps/backend/src/db/schemas");
const SCHEMA_INDEX_PATH = resolve("apps/backend/src/db/schema.ts");

const inputName = process.argv[2];
if (!inputName) {
  console.error("❌ Schema name is required.");
  console.error("   Usage: bun run make:schema <schema-name>");
  console.error("   Example: bun run make:schema products");
  process.exit(1);
}

// Normalize name to kebab-case/snake-case for filename
const normalizedName = inputName.toLowerCase().replace(/[^a-z0-9_-]/g, "");
if (!normalizedName) {
  console.error("❌ Invalid schema name.");
  process.exit(1);
}

// Convert input name to camelCase for the exported variable
const camelCase = (str: string) =>
  str
    .toLowerCase()
    .replace(/[-_]([a-z0-9])/g, (_, g) => g.toUpperCase())
    .replace(/^[A-Z]/, (g) => g.toLowerCase());

// Convert input name to snake_case for the database table name
const snakeCase = (str: string) =>
  str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/[-_]+/g, "_")
    .replace(/^_+|_+$/g, "");

// Convert input name to singular PascalCase for TypeScript type name
const singularPascal = (str: string) => {
  const camel = str
    .toLowerCase()
    .replace(/[-_]([a-z0-9])/g, (_, g) => g.toUpperCase())
    .replace(/^[a-z]/, (g) => g.toUpperCase());
  
  if (camel.endsWith("ies")) {
    return camel.slice(0, -3) + "y";
  }
  if (camel.endsWith("es") && !camel.endsWith("ss") && !camel.endsWith("sh") && !camel.endsWith("ch")) {
    return camel.slice(0, -2);
  }
  if (camel.endsWith("s") && !camel.endsWith("ss")) {
    return camel.slice(0, -1);
  }
  return camel;
};

const variableName = camelCase(normalizedName);
const tableName = snakeCase(normalizedName);
const typeName = singularPascal(normalizedName);
const fileName = `${normalizedName}.schema.ts`;
const filePath = join(SCHEMAS_DIR, fileName);

if (!existsSync(SCHEMAS_DIR)) {
  mkdirSync(SCHEMAS_DIR, { recursive: true });
}

if (existsSync(filePath)) {
  console.error(`❌ Schema file already exists: ${filePath}`);
  process.exit(1);
}

const template = `import { pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const ${variableName} = pgTable("${tableName}", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ${typeName} = typeof ${variableName}.$inferSelect;
export type New${typeName} = typeof ${variableName}.$inferInsert;
`;

// Write the new schema file
const fd = openSync(filePath, "w");
writeFileSync(fd, template, "utf-8");
closeSync(fd);
console.log(`✅ Schema file created: apps/backend/src/db/schemas/${fileName}`);

// Add export statement to schema.ts if it doesn't already exist
const exportStatement = `export * from "./schemas/${normalizedName}.schema";`;
let schemaIndexContent = "";

if (existsSync(SCHEMA_INDEX_PATH)) {
  schemaIndexContent = readFileSync(SCHEMA_INDEX_PATH, "utf-8");
}

if (!schemaIndexContent.includes(exportStatement)) {
  const separator = schemaIndexContent.endsWith("\n") || schemaIndexContent === "" ? "" : "\n";
  schemaIndexContent = `${schemaIndexContent}${separator}${exportStatement}\n`;
  const fdIndex = openSync(SCHEMA_INDEX_PATH, "w");
  writeFileSync(fdIndex, schemaIndexContent, "utf-8");
  closeSync(fdIndex);
  console.log(`✅ Added export to apps/backend/src/db/schema.ts`);
} else {
  console.log(`ℹ️ Export already exists in apps/backend/src/db/schema.ts`);
}
