import express from "express";
import { getMyTaxRecords } from "../controllers/taxController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMyTaxRecords);

export default router;