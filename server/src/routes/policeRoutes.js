import express from "express";
import multer from "multer";
import { 
  getMyPoliceRecords,
  getAllUsersForPolice,
  updatePoliceVerification,
  uploadNidAndOcr,
  getPoliceRecordByCitizenId,
  addPoliceCase,
  updatePoliceCaseStatus,
  downloadPoliceReport
} from "../controllers/policeController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/me", protect, getMyPoliceRecords);
router.get("/users", protect, adminOnly, getAllUsersForPolice);
router.get("/citizen/:citizenId", protect, adminOnly, getPoliceRecordByCitizenId);
router.put("/update/:id", protect, adminOnly, updatePoliceVerification);
router.post("/upload-nid/:citizenId", protect, adminOnly, upload.single("nid"), uploadNidAndOcr);

// Case management endpoints
router.post("/cases/:citizenId", protect, adminOnly, addPoliceCase);
router.put("/cases/:citizenId/:caseNumber", protect, adminOnly, updatePoliceCaseStatus);

// Report Download endpoints
router.get("/report/download", protect, downloadPoliceReport);
router.get("/report/download/:citizenId", protect, adminOnly, downloadPoliceReport);

export default router;
