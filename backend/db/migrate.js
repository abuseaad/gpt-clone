import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const file = process.argv[2];
if (!file) {
  console.error("Usage: node db/migrate.js <migration-file-name>");
  process.exit(1);
}

const sql = fs.readFileSync(path.resolve(__dirname, "migrations", file), "utf8");

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  multipleStatements: true, // lets one file contain several SQL statements
});

try {
  await connection.query(sql);
  console.log("Migration applied:", file);

  const [tables] = await connection.query("SHOW TABLES");
  console.log("Tables:", tables.map((row) => Object.values(row)[0]));

  const [columns] = await connection.query("SHOW COLUMNS FROM conversations");
  console.log("conversations columns:", columns.map((c) => c.Field));
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}