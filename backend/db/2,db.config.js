// Step 1: Import the MySQL client
import mysql from 'mysql2/promise';

// Step 2: Create a connection pool using environment variables
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Step 3: Safe helper used by the auth service (requires SQL text and parameters)
export const safeExecute = async (sql, params) => {
  if (typeof sql !== 'string' || sql.trim().length === 0) {
    throw new Error('SQL query must be a non-empty string');
  }
  if (params === undefined || params === null || typeof params !== 'object') {
    throw new Error('SQL parameters must be an array or object');
  }
  const [result] = await db.execute(sql, params);
  return result;
};

// Step 4: Export the pool so any file can run queries
export default db;