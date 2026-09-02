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
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());  //beultinmeddleware
// app.use(express.urlencoded({ extended: true }));

// Step 6: Register application routes
app.use("/api", mainRoutes);


// Step 7: Register error-handling middleware LAST, after all routes(final meddleware for error handling)
app.use(errorHandler);


// Step 8: Verify the DB connection, then start listening
async function startServer() {
  try {
    const connection = await db.getConnection();
    console.log("Database connected successfully!");
    connection.release();

    app.listen(3888, (err) => {
      if (err) {
        throw err;
      }
      console.log("Server is running on port http://localhost:3888");
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}
startServer();
