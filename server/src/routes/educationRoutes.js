import express from "express";
import { getEducationRecords } from "../controllers/educationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/", getEducationRecords);

export default router;
