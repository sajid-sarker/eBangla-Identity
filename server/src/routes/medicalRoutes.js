import express from "express";
const router = express.Router();
import { getMyMedicalRecords, updateMedicalRecord, getAdminMedicalRecordByCitizen } from "../controllers/medicalController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

router.get("/my-records", protect, getMyMedicalRecords);
router.get("/admin/citizen/:nid", protect, authorize("medical", "superuser"), getAdminMedicalRecordByCitizen);
router.post("/update", protect, authorize("medical", "superuser"), updateMedicalRecord);

export default router;