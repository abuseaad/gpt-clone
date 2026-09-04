// Step 1: Import the database pool and the Gemini SDK
import db from "../../../../db/2,db.config.js";
import { GoogleGenAI } from "@google/genai";

// Step 2: Read AI config from environment
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Step 3: Fetch recent conversation rows (used both for API responses and as chat context)
export const getRecentConversationRows = async (limit = 5) => {
  const normalizedLimit = Number.parseInt(limit, 10);
  const safeLimit =
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 20 : normalizedLimit;
  const [rows] = await db.execute(
    `SELECT id, role, content, created_at
     FROM conversations
     ORDER BY id DESC
     LIMIT ${safeLimit}`,
  );
  return rows.reverse();
};

// Step 4: Send the question + history to Gemini and get a reply
export const generateAssistantAnswer = async ({ historyRows, question }) => {
  // Format history for Gemini startChat
  const formattedHistory = historyRows.map((row) => ({
    role: row.role === "assistant" ? "model" : "user",
    parts: [{ text: row.content }],
  }));

  const chat = geminiClient.chats.create({
    model: GEMINI_MODEL,
    config: {
      maxOutputTokens: 1000,
      systemInstruction: `**Role:** You are a senior physician and medical expert.

**Your primary responsibility:** Assist customers/users **only with medical and healthcare-related questions and concepts**.

* Provide clear, accurate, evidence-based medical information.
* Explain medical concepts in simple language when appropriate.
* For clinical questions, include relevant differential diagnoses, investigations, management principles, and important red flags when appropriate.
* Use professional medical terminology, but explain difficult terms clearly.
* Do not provide assistance with unrelated topics such as programming, technology, entertainment, finance, or general non-medical questions.
* If a user asks about a non-medical topic, politely explain that your role is limited to medical and healthcare-related assistance.
* Do not replace an in-person physician; for emergencies or potentially serious conditions, advise the user to seek appropriate medical care.
* Prioritize patient safety and avoid unsupported or misleading medical claims.
.`,
    },
    history: formattedHistory,
  });
  const result = await chat.sendMessage({ message: question });
  console.log(result.usageMetadata);
  return {
    text: result.text,
    totalTokens: result.usageMetadata?.totalTokenCount || 0,
  };
};

// Step 5: Look up a single saved message by id (used to return fresh rows after insert)
const getMessageById = async (messageId) => {
  const [rows] = await db.execute(
    "SELECT id, role, content, token_count, created_at FROM conversations WHERE id = ? LIMIT 1",
    [messageId],
  );
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    role: rows[0].role,
    content: rows[0].content,
    tokenCount: Number(rows[0].token_count || 0),
    createdAt: rows[0].created_at,
  };
};

// Step 6: Orchestrate the full "ask a question" flow
export async function createConversationService(question) {
  try {
    // 6a. Validate BEFORE calling .trim() — question may be undefined
    if (!question || !question.trim()) {
      const error = new Error("question is required");
      error.status = 400;
      throw error;
    }

    // 6b. Get prior messages for context (fetched before inserting the new one)
    const historyRows = await getRecentConversationRows(5);

    // 6c. Save the user's question
    const [result] = await db.execute(
      'INSERT INTO conversations (content, role) VALUES (?, "user")',
      [question],
    );

    // 6d. Ask Gemini for a reply
    const assistantAnswer = await generateAssistantAnswer({
      historyRows,
      question,
    });

    //**********************************8 */

    console.log("assistantAnswer:", assistantAnswer);

    //************************************8 */

     // 6e. Save the assistant's reply
    const [createAssistantMessageResult] = await db.execute(
      "INSERT INTO conversations (role, content, token_count) VALUES (?, ?, ?)",
      ["assistant", assistantAnswer.text, assistantAnswer.totalTokens],
    );

    
    // 6f. Return both saved rows to the caller
    const userConversation = await getMessageById(result.insertId);
    const assistantConversation = await getMessageById(
      createAssistantMessageResult.insertId,
    );

    return {
      userConversation,
      assistantConversation,
    };
  } catch (error) {
    console.error("Conversation service error:", error);
    throw error;
  }
}
