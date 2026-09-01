// Step 1: Import Express and controllers
import express from "express";
import {createConversationController, getConversationsController} from "./controller/4,chat.controller.js"

// Step 2: Create a scoped router
const chatRouter = express.Router();


// Step 3: Define routes — these live under /api/chat (see main.routes.js)
// /api/chat/conversations
chatRouter.post('/conversations', createConversationController);
chatRouter.get('/conversations', getConversationsController);


// Step 4: Export for main.routes.js to mount
export default chatRouter;
