import { GoogleGenerativeAI } from "@google/generative-ai";

import {
  searchUniversalItems
} from "../controllers/universalSearchController.js";


const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);


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

    const result =
      await model.generateContent(prompt);

    let responseText =
      result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();

    const parsedData =
      JSON.parse(responseText);

    res.json(parsedData);

  } catch (error) {

    console.error(
      "AI Error:",
      error
    );

    res.status(500).json({
      error: "AI logic failed ra Raju!"
    });

  }
};


// ======================================================
// SUDARA UNIVERSAL SEARCH
// ======================================================
//
// IMPORTANT:
//
// Normal search does NOT use Gemini.
//
// User
//   ↓
// parseUniversalSearch()
//   ↓
// searchUniversalItems()
//   ↓
// MongoDB
//   ↓
// Results
//
// Gemini is ONLY used above for Voice Order AI.
// ======================================================

export const parseUniversalSearch = async (
  req,
  res
) => {

  try {

    const {
      query = "",

      minPrice = null,

      maxPrice = null,

      maxDistanceKm = null,

      latitude = null,

      longitude = null,

      availability = null,

      category = null,

      subCategory = null,

      foodType = null,

      state = "All",

      district = "Select",

      sort = "relevance"

    } = req.body || {};


    // ==================================================
    // VALIDATE QUERY
    // ==================================================

    const cleanQuery =
      String(query).trim();


    if (!cleanQuery) {

      return res.status(400).json({

        success: false,

        message:
          "Search query is required."

      });

    }


    // ==================================================
    // DIRECT DATABASE SEARCH
    // ==================================================

    console.log(
      "🔎 SUDARA DIRECT DB SEARCH:",
      {
        query: cleanQuery,
        minPrice,
        maxPrice,
        maxDistanceKm,
        latitude,
        longitude,
        availability,
        category,
        subCategory,
        foodType,
        state,
        district,
        sort
      }
    );


    const results =
      await searchUniversalItems({

        query: cleanQuery,

        minPrice,

        maxPrice,

        maxDistanceKm,

        latitude,

        longitude,

        availability,

        category,

        subCategory,

        foodType,

        state,

        district,

        sort

      });


    // ==================================================
    // CHECK RESULT
    // ==================================================

    console.log(
      `🔎 SUDARA DB RESULT: ${results.length} items found`
    );


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.json({

      success: true,

      originalQuery:
        cleanQuery,

      search: {

        query:
          cleanQuery,

        minPrice:
          minPrice ?? null,

        maxPrice:
          maxPrice ?? null,

        maxDistanceKm:
          maxDistanceKm ?? null,

        availability:
          availability ?? null,

        category:
          category ?? null,

        subCategory:
          subCategory ?? null,

        foodType:
          foodType ?? null,

        state,

        district,

        sort

      },

      count:
        results.length,

      results

    });


  } catch (error) {

    console.error(
      "❌ Direct Universal Search Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Universal search failed.",

      error:
        error.message

    });

  }

};