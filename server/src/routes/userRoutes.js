import express from "express";
import multer from "multer";
import { getMe, uploadProfilePicture, getProfilePicture, updateProfile, getCitizenByNid } from "../controllers/userController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Configure Multer for profile pictures: memory storage, 512kB limit, images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 512 * 1024, // 512kB
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/webp"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (.jpg, .jpeg, .png, .webp) are allowed!"), false);
    }
  },
});

// Protected routes
router.get("/me", protect, getMe);
router.post("/profile-picture", protect, upload.single("profilePicture"), uploadProfilePicture);
router.put("/profile", protect, updateProfile);

// Admin only routes
router.get("/admin/citizen/:nid", protect, adminOnly, getCitizenByNid);

// Public route - for serving avatar images anywhere in the app
router.get("/profile-picture/:id", getProfilePicture);

export default router;
