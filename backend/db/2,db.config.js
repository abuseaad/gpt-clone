// Step 1: Import the MySQL client
import mysql from 'mysql2/promise';

// Step 2: Create a connection pool using environment variables
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Step 3: Export the pool so any file can run queries
export default db;