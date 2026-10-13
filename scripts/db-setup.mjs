import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// Load DATABASE_URL from .env.local when running locally.
try {
  const envText = readFileSync(".env.local", "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
} catch {
  // If there is no .env.local, rely on the real environment (e.g. on Vercel).
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

function splitStatements(sqlText) {
  return sqlText
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const schemaSql = readFileSync("db/schema.sql", "utf8");

// Start fresh so the script can be run more than once.
const statements = [
  "DROP TABLE IF EXISTS reviews",
  "DROP TABLE IF EXISTS restaurants",
  ...splitStatements(schemaSql),
];

for (const statement of statements) {
  await sql.query(statement);
}

const restaurants = await sql.query(
  "SELECT id, name, cuisine, area FROM restaurants ORDER BY id",
);
const reviews = await sql.query(
  "SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY created_at DESC",
);

console.log("restaurants:", JSON.stringify(restaurants, null, 2));
console.log("reviews:", JSON.stringify(reviews, null, 2));