import express from "express";
import { getReport, downloadReport } from "../controllers/reportController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Dashboard report data
router.get("/", getReport);

// PDF download
router.get("/download", protect, downloadReport);

export default router;