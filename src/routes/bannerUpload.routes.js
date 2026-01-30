import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * ADMIN – Upload Advertisement Banner Image
 */
router.post(
  "/upload",
  requireAuth,
  requireAdmin,
  uploadImage
);

export default router;
