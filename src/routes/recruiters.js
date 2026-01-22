import express from "express"
import { requireAuth } from "../middleware/auth.js"
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  getMyRecruiterProfile,
} from "../controllers/recruitersController.js"

const router = express.Router()

// 🔐 LOGGED-IN recruiter (MUST be above :username)
router.get("/me", requireAuth, getMyRecruiterProfile)

// 🌍 PUBLIC recruiter profile
router.get("/:username", getRecruiterProfile)

// ✏️ UPDATE recruiter profile
router.put("/profile", requireAuth, updateRecruiterProfile)

export default router
