import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const parseUniversalSearch = async (req, res) => {
    try {
        const { query } = req.body || {};

        if (!query || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required."
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const prompt = `
You are Sudara's Universal Search AI.

Your job is ONLY to understand the user's natural-language search
and convert it into structured JSON.

User query:
"${query}"

Return ONLY valid JSON in this exact structure:

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

Rules:

1. Extract ONLY information explicitly stated or clearly implied by
the user's query.
2. NEVER invent price, distance, category, location or availability.
3. "itemQuery" should contain what the user actually wants.
4. If the user says "under ₹250", maxPrice = 250.
5. If the user says "above ₹100", minPrice = 100.
6. If the user says "cheap", use sort = "price_asc".
7. If the user says "expensive", use sort = "price_desc".
8. If the user says "best rated", use sort = "rating_desc".
9. If the user says "nearby", set useUserLocation = true.
10. If the user gives a distance such as "within 5 km",
    maxDistanceKm = 5.
11. If the user asks for currently available/open items,
    availability = true.
12. Understand Telugu, English and Telugu-English mixed language.
13. Do not answer the user. Return JSON only.

Examples:

User:
"naku chicken biryani kavali"

JSON:
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

JSON:
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
`;

        const result = await model.generateContent(prompt);

        let responseText = result.response
            .text()
            .replace(/```json|```/g, "")
            .trim();

        const parsedData = JSON.parse(responseText);

        return res.json({
            success: true,
            originalQuery: query,
            search: parsedData
        });

    } catch (error) {
        console.error("Universal Search AI Error:", error);

        return res.status(500).json({
            success: false,
            message: "AI search parsing failed."
        });
    }
};