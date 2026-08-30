import "dotenv/config";
import express from "express";
import db from "./db/db.config.js";
import mainRoutes from "./src/api/main.routes.js";
import { errorHandler } from "./src/middleware/error-handler.js";

const app = express();
app.use(express.json());
// app.use(express.urlencoded({extended: true}));
app.use("/api", mainRoutes);

// final meddleware for error handling
app.use(errorHandler);

async function startServer() {
  try {
    const connection = await db.getConnection();
    console.log("Database connected successfully!");
    connection.release();

    app.listen(3888, (err) => {
      if (err) {
        throw err;
      }
      console.log("Server is running on port 3888");
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}
startServer();
