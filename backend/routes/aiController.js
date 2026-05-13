import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const processVoiceOrder = async (req, res) => {
  try {
    const { transcript, menuItems } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are "Sudara AI", a professional and friendly Telugu waiter at a restaurant.
      
      Context:
      - Menu Data: ${JSON.stringify(menuItems)}
      - Customer said: "${transcript}"

      Your Goals:
      1. Analyze what the customer said. 
      2. If they want to order: Identify items, match them to the menu, and calculate the total.
      3. If they are just asking a question (e.g., "What is famous here?"): Answer based on the menu.
      4. **Crucial:** Generate a natural, friendly reply in Telugu that matches the customer's energy.
      5. If they are ordering, ask if they prefer 'Pre-book' or 'Post-book' in a conversational way.

      Response Format (STRICT JSON ONLY):
      {
        "items": [{"id": "item_id", "name": "item_name", "price": 100, "qty": 1}],
        "reply": "Write your natural Telugu response here based on the conversation.",
        "intent": "order" | "question" | "greeting"
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().replace(/```json|```/g, "").trim();
    
    // JSON పార్సింగ్ చేసేటప్పుడు ఎర్రర్ రాకుండా జాగ్రత్త
    const parsedData = JSON.parse(responseText);
    res.json(parsedData);

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI logic failed ra Raju!" });
  }
};