// Step 1: Import Express, middleware and controllers
import express from "express";
import {
  createConversationController,
  getConversationsController,
  createChatController,
  listChatsController,
  getChatMessagesController,
  sendChatMessageController,
  renameChatController,
  deleteChatController,
} from "./controller/4,chat.controller.js";
import { authenticateUser } from "../../middleware/authentication.js";
import {
  createChatValidation,
  chatIdValidation,
  sendMessageValidation,
  renameChatValidation,
} from "./validation/chat.validation.js";

// Step 2: Create a scoped router
const chatRouter = express.Router();


// Step 3: Define routes — these live under /api/chat (see main.routes.js)
// /api/chat/conversations  (old, still unprotected — replaced in a later step)
chatRouter.post('/conversations', createConversationController);
chatRouter.get('/conversations', getConversationsController);

// /api/chat/chats  (new, private: the user must be logged in)
chatRouter.post('/chats', authenticateUser, createChatValidation, createChatController);
chatRouter.get('/chats', authenticateUser, listChatsController);
chatRouter.get('/chats/:chatId/messages', authenticateUser, chatIdValidation, getChatMessagesController);
chatRouter.post('/chats/:chatId/messages', authenticateUser, sendMessageValidation, sendChatMessageController);
chatRouter.patch('/chats/:chatId', authenticateUser, renameChatValidation, renameChatController);
chatRouter.delete('/chats/:chatId', authenticateUser, chatIdValidation, deleteChatController);


// Step 4: Export for main.routes.js to mount
export default chatRouter;