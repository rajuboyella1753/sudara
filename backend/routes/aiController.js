import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  searchUniversalItems
} from "../controllers/universalSearchController.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// ======================================================
// VOICE ORDER AI
// ======================================================

export const processVoiceOrder = async (req, res) => {
  try {
    const { transcript, menuItems } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
      You are "Sudara AI", a professional and friendly Telugu waiter at a restaurant.

      Context:
      - Menu Data: ${JSON.stringify(menuItems)}
      - Customer said: "${transcript}"

      Your Goals:
      1. Analyze what the customer said.
      2. If they want to order: Identify items, match them to the menu, and calculate the total.
      3. If they are just asking a question (e.g., "What is famous here?"): Answer based on the menu.
      4. Generate a natural, friendly reply in Telugu.
      5. If they are ordering, ask if they prefer 'Pre-book' or 'Post-book'.

      Response Format (STRICT JSON ONLY):

      {
        "items": [
          {
            "id": "item_id",
            "name": "item_name",
            "price": 100,
            "qty": 1
          }
        ],
        "reply": "Write your natural Telugu response here.",
        "intent": "order" | "question" | "greeting"
      }
    `;

    const result = await model.generateContent(prompt);

    let responseText = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();

    const parsedData = JSON.parse(responseText);

    res.json(parsedData);

  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      error: "AI logic failed ra Raju!"
    });
  }
};
const generateUniversalSearchAI = async (prompt) => {
  const models = [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite"
  ];

  let lastError = null;

  for (const modelName of models) {
    try {
      console.log(`🤖 Sudara AI trying model: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName
      });

      const result = await model.generateContent(prompt);

      console.log(`✅ Sudara AI success: ${modelName}`);

      return result;

    } catch (error) {
      lastError = error;

      console.error(
        `❌ Sudara AI failed with ${modelName}:`,
        error?.message || error
      );

      // Small delay before trying fallback
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw lastError;
};

// ======================================================
// SUDARA UNIVERSAL SEARCH AI
// ======================================================

export const parseUniversalSearch = async (req, res) => {
  try {

   const {
  query,
  state = "All",
  district = "Select"
} = req.body || {};

    // --------------------------------------------------
    // VALIDATE QUERY
    // --------------------------------------------------

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required."
      });
    }


    // --------------------------------------------------
    // GEMINI MODEL
    // --------------------------------------------------

   


    // --------------------------------------------------
    // AI SEARCH UNDERSTANDING PROMPT
    // --------------------------------------------------

    const prompt = `
You are "Sudara AI", a universal search understanding system.

Sudara allows users to search for products, food, shops,
services and other items using natural language.

User query:
"${query}"

Your job is ONLY to understand the user's query and convert it
into structured JSON.

IMPORTANT RULES:

1. Understand Telugu, English and Telugu-English mixed language.

2. Extract ONLY what the user actually asks.

3. NEVER invent price, distance, location, category,
   food type or any other constraint.

4. "itemQuery" must contain the actual item/product/service
   the user wants.

5. Ignore conversational words such as:
   "naku",
   "kavali",
   "ekkada",
   "dorukutundi",
   "cheppu",
   "want",
   "please",
   "kavali ani",
   "ekkada dorukutundi".

6. "under ₹250" or "₹250 lopu" means:
   maxPrice = 250

7. "above ₹100" or "₹100 paina" means:
   minPrice = 100

8. "cheap", "cheap ga", "takkuva price",
   "thakkuva rate" means:
   sort = "price_asc"

9. "expensive", "costly", "ekkuva price"
   means:
   sort = "price_desc"

10. "best rated", "top rated", "manchi rating"
    means:
    sort = "rating_desc"

11. "nearby", "near me", "daggarlo",
    "daggara" means:
    useUserLocation = true

12. "within 5 km", "5 km lopu",
    "within 3 km", etc. means:
    maxDistanceKm = the mentioned number

    AND

    useUserLocation = true

13. If the user asks for currently available,
    available now, open now, currently open:

    availability = true

14. If the user specifically asks for Veg:
    foodType = "Veg"

15. If the user specifically asks for Non-Veg:
    foodType = "Non-Veg"

16. If the user specifically asks for Both:
    foodType = "Both"

17. If no value is mentioned,
    keep that value null.

18. Do NOT invent a location.

19. Do NOT invent a price.

20. Do NOT invent a category.

21. Do NOT invent distance.

22. Return ONLY valid JSON.

23. Do NOT explain anything outside JSON.


Return EXACTLY this structure:

{
  "intent": "search",
  "itemQuery": null,
  "ownerQuery": null,
  "category": null,
  "subCategory": null,
  "minPrice": null,
  "maxPrice": null,
  "foodType": null,
  "availability": null,
  "sort": "relevance",
  "maxDistanceKm": null,
  "useUserLocation": false
}


EXAMPLES:


User:
"naku chicken biryani kavali"

Output:

{
  "intent": "search",
  "itemQuery": "chicken biryani",
  "ownerQuery": null,
  "category": null,
  "subCategory": null,
  "minPrice": null,
  "maxPrice": null,
  "foodType": null,
  "availability": null,
  "sort": "relevance",
  "maxDistanceKm": null,
  "useUserLocation": false
}


User:
"₹250 lopu mutton biryani kavali"

Output:

{
  "intent": "search",
  "itemQuery": "mutton biryani",
  "ownerQuery": null,
  "category": null,
  "subCategory": null,
  "minPrice": null,
  "maxPrice": 250,
  "foodType": null,
  "availability": null,
  "sort": "relevance",
  "maxDistanceKm": null,
  "useUserLocation": false
}


User:
"nearby chicken biryani"

Output:

{
  "intent": "search",
  "itemQuery": "chicken biryani",
  "ownerQuery": null,
  "category": null,
  "subCategory": null,
  "minPrice": null,
  "maxPrice": null,
  "foodType": null,
  "availability": null,
  "sort": "relevance",
  "maxDistanceKm": null,
  "useUserLocation": true
}


User:
"5 km lopu chicken biryani"

Output:

{
  "intent": "search",
  "itemQuery": "chicken biryani",
  "ownerQuery": null,
  "category": null,
  "subCategory": null,
  "minPrice": null,
  "maxPrice": null,
  "foodType": null,
  "availability": null,
  "sort": "relevance",
  "maxDistanceKm": 5,
  "useUserLocation": true
}


User:
"cheap chicken biryani"

Output:

{
  "intent": "search",
  "itemQuery": "chicken biryani",
  "ownerQuery": null,
  "category": null,
  "subCategory": null,
  "minPrice": null,
  "maxPrice": null,
  "foodType": null,
  "availability": null,
  "sort": "price_asc",
  "maxDistanceKm": null,
  "useUserLocation": false
}


User:
"best rated chicken biryani nearby"

Output:

{
  "intent": "search",
  "itemQuery": "chicken biryani",
  "ownerQuery": null,
  "category": null,
  "subCategory": null,
  "minPrice": null,
  "maxPrice": null,
  "foodType": null,
  "availability": null,
  "sort": "rating_desc",
  "maxDistanceKm": null,
  "useUserLocation": true
}
`;


    // --------------------------------------------------
    // CALL GEMINI
    // --------------------------------------------------

const result = await generateUniversalSearchAI(prompt);

    let responseText = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();


    // --------------------------------------------------
    // PARSE AI JSON
    // --------------------------------------------------

    const parsedData = JSON.parse(responseText);


    // --------------------------------------------------
    // LOCATION DEBUG
    // --------------------------------------------------

    console.log("AI SEARCH DEBUG:", {
      originalQuery: query,
      useUserLocation: parsedData.useUserLocation,
      maxDistanceKm: parsedData.maxDistanceKm,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    });


    // --------------------------------------------------
    // SEARCH DATABASE
    // --------------------------------------------------

    const results = await searchUniversalItems({

      query: parsedData.itemQuery || "",

      minPrice: parsedData.minPrice,

      maxPrice: parsedData.maxPrice,

      maxDistanceKm: parsedData.useUserLocation
        ? parsedData.maxDistanceKm
        : null,

    latitude: req.body.latitude,
    longitude: req.body.longitude,

      availability: parsedData.availability,

      category: parsedData.category,

      subCategory: parsedData.subCategory,

      foodType: parsedData.foodType,

      sort: parsedData.sort,
      state,
      district

    });


    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.json({

      success: true,

      originalQuery: query,

      search: parsedData,

      count: results.length,

      results

    });


  } catch (error) {

    console.error(
      "Universal Search AI Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Universal Search AI failed.",

      error: error.message

    });

  }
};