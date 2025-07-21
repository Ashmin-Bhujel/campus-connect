import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Environment variables
config();
const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    url: databaseUrl!,
  },
});
