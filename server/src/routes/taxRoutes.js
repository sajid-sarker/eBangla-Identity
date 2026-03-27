import express from "express";
import {
  createTaxRecord,
  getTaxRecords,
} from "../controllers/taxController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes
// POST: http://localhost:5000/api/tax/submit
router.post("/submit", protect, createTaxRecord);

// GET: http://localhost:5000/api/tax
router.get("/", protect, getTaxRecords);

export default router;
