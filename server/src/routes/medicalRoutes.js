import express from "express";
import { getMyMedicalRecords } from "../controllers/medicalController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMyMedicalRecords);

export default router;
