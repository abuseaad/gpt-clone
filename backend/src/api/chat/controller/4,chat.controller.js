// Step 1: Import service functions
import { 
      createConversationService,
  getRecentConversationRows,
  createChatService,
  listChatsService,
  getChatMessagesService,
  sendChatMessageService,
  renameChatService,
  deleteChatService,
 } from '../service/3,chat.service.js';



// Step 2: Handle POST /api/chat/conversations
export async function createConversationController(req, res, next){
    try {
        const {question} = req.body
        const result = await createConversationService(question);
       res.status(201).json({
       success: true,
       message:'conversation posted successfully ',
       data: result, 
       });
    } catch (error) { 
        // console.error(error.message);
          //  res.status(400).send(error.message);
           next(error); // hand off to the error-handling middleware
        
    }
 
}
// Step 3: Handle GET /api/chat/conversations
export async function getConversationsController(req, res, next) {
  try {
    const result = await getRecentConversationRows(100);
    res.status(200).json({
      success: true,
      message: 'Conversations fetched successfully.',
      data: result,
    });
  } catch (error) {
    throw error;
      // next(error);
  }
}

// Step 4: Handle POST /api/chat/chats  (create a chat for the logged-in user)
export async function createChatController(req, res, next) {
  try {
    const chat = await createChatService(req.user.id, req.body.title);
    res.status(201).json({
      success: true,
      message: 'Chat created successfully.',
      data: chat,
    });
  } catch (error) {
    next(error);
  }
}

// Step 5: Handle GET /api/chat/chats  (list the logged-in user's chats)
export async function listChatsController(req, res, next) {
  try {
    const chats = await listChatsService(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Chats fetched successfully.',
      data: chats,
    });
  } catch (error) {
    next(error);
  }
}

// Step 6: Handle GET /api/chat/chats/:chatId/messages
export async function getChatMessagesController(req, res, next) {
  try {
    const messages = await getChatMessagesService(
      req.user.id,
      Number(req.params.chatId),
    );
    res.status(200).json({
      success: true,
      message: 'Messages fetched successfully.',
      data: messages,
    });
  } catch (error) {
    next(error);
  }
}

// Step 7: Handle POST /api/chat/chats/:chatId/messages
export async function sendChatMessageController(req, res, next) {
  try {
    const result = await sendChatMessageService(
      req.user.id,
      Number(req.params.chatId),
      req.body.question,
    );
    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// Step 8: Handle PATCH /api/chat/chats/:chatId  (rename)
export async function renameChatController(req, res, next) {
  try {
    const chat = await renameChatService(
      req.user.id,
      Number(req.params.chatId),
      req.body.title,
    );
    res.status(200).json({
      success: true,
      message: 'Chat renamed successfully.',
      data: chat,
    });
  } catch (error) {
    next(error);
  }
}

// Step 9: Handle DELETE /api/chat/chats/:chatId
export async function deleteChatController(req, res, next) {
  try {
    await deleteChatService(req.user.id, Number(req.params.chatId));
    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}