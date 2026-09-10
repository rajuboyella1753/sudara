import express from "express";
import { universalSearch } from "../controllers/universalSearchController.js";
import { parseUniversalSearch } from "./aiController.js";
const router = express.Router();

// Universal Search
router.post("/universal", universalSearch);
router.post("/universal-ai", parseUniversalSearch);
export default router;