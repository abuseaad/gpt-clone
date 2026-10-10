// Step 1: Load environment variables first — everything else depends on them
import "dotenv/config";

// Step 2: Import Express and core dependencies
import express from "express";
import cors from "cors";

// Step 3: Import your own modules
import db from "./db/2,db.config.js";
import mainRoutes from "./src/api/6,main.routes.js";
import { errorHandler } from "./src/middleware/7,error-handler.js";

// Step 4: Initialize the Express app
const app = express(); 

// Step 5: Register global middleware (CORS, body parsing)
// Allows requests from local development or your live deployed frontend URL
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL // You can set this variable on Railway once frontend is live
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Change to callback(new Error('Not allowed by CORS')) if strict
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Step 6: Register application routes
app.use("/api", mainRoutes);

// Step 7: Register error-handling middleware LAST
app.use(errorHandler);

// Step 8: Define Port dynamically
const PORT = process.env.PORT || 3888;

// Step 9: Verify the DB connection, then start listening
async function startServer() {
  try {
    const connection = await db.getConnection();
    console.log("Database connected successfully!");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}
startServer();