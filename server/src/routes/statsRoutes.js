import express from "express";
import { getDashboardStats } from "../controllers/statsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardStats);

export default router;
