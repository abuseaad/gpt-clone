// Step 1: Import service functions
import { 
      createConversationService,
  getRecentConversationRows,
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
        console.error(error.message);
           res.status(400).send(error.message);
          //  next(error); // hand off to the error-handling middleware
        
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



  