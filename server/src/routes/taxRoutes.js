import express from "express";
import {
  createTaxRecord,
  getTaxRecords,
} from "../controllers/taxController.js";

// 1. ADDED 'setOfficialIncome' TO THE IMPORTS
import {
  getCitizenTaxRecords,
  updateTaxStatus,
  setOfficialIncome, 
} from "../controllers/adminTaxController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// --- CITIZEN ROUTES ---
router.post("/submit", protect, createTaxRecord);
router.get("/", protect, getTaxRecords);


// --- FIELD OFFICER / ADMIN ROUTES ---

// GET: Fetch records for a specific citizen
router.get("/admin/citizen/:citizenId", protect, adminOnly, getCitizenTaxRecords);

// PATCH: Update status (Approve/Reject)
router.patch("/admin/status/:recordId", protect, adminOnly, updateTaxStatus);

// 2. ADDED THIS NEW ROUTE:
// This handles the "Set Annual Income" modal submission
// PATCH: http://localhost:5000/api/tax/admin/update-citizen/:citizenId
router.patch("/admin/update-citizen/:citizenId", protect, adminOnly, setOfficialIncome);

export default router;