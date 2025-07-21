import { config } from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";

// Environment variables
config();
const databaseUrl = process.env.DATABASE_URL;

export const db = drizzle({
  connection: { uri: databaseUrl! },
  casing: "snake_case",
});
