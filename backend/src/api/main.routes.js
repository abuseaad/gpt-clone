import express from "express"
import chatRouter from "./chat/chat.routes.js";

const mainRoutes = express.Router();

// /api/chat
mainRoutes.use('/chat', chatRouter);

export default mainRoutes;