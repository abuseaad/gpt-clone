// Step 1: Import Express and feature routers
import express from "express";
import chatRouter from "./chat/5,chat.routes.js";
import authRouter from "./auth/routes/auth.route.js";

// Step 2: Create the aggregating router
const mainRoutes = express.Router();

// Step 3: Mount feature routers under their base paths
// /api/auth
mainRoutes.use('/auth', authRouter);

// /api/chat
mainRoutes.use('/chat', chatRouter);

// /api/admin
// mainRoutes.use('/admin', chatRouter);

// Step 4: Export for index.js
export default mainRoutes;