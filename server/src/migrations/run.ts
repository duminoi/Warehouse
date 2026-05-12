import fs from "fs";
import path from "path";
import { query, testConnection } from "../config/database";

async function runMigrations(): Promise<void> {
  console.log("🚀 Running migrations...");

  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }

  const migrationsDir = path.join(__dirname);
  const sqlFiles = fs.readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of sqlFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    console.log(`📄 Executing: ${file}`);
    try {
      await query(sql);
      console.log(`  ✅ ${file} completed`);
    } catch (error) {
      console.error(`  ❌ ${file} failed:`, error);
      process.exit(1);
    }
  }

  console.log("✅ All migrations completed successfully!");
  process.exit(0);
}

runMigrations();
