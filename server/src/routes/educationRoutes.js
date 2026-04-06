import express from "express";
import multer from "multer";
import {
  getEducationRecords,
  uploadEducationDocument,
  getEducationDocument,
} from "../controllers/educationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Configure multer for education documents
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .pdf, .jpg, .jpeg and .png formats allowed!"), false);
    }
  },
});

// All routes are protected
router.use(protect);

router.get("/", getEducationRecords);

// Document upload and retrieval
router.post("/document", upload.single("document"), uploadEducationDocument);
router.get("/:id/document", getEducationDocument);

export default router;
