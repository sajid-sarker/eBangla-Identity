import express from "express";
import { getCitizenScore } from "../controllers/scoreController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET citizen score
router.get("/", protect, getCitizenScore);

export default router;