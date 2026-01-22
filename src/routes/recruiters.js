import express from "express"
import { requireAuth } from "../middleware/auth.js"
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  getMyRecruiterProfile,
  getRecruiterDashboard,
} from "../controllers/recruitersController.js"

const router = express.Router()

// 🔐 Logged-in recruiter
router.get("/me", requireAuth, getMyRecruiterProfile)

// 📊 Recruiter dashboard
router.get("/dashboard", requireAuth, getRecruiterDashboard)

// 🌍 Public recruiter profile
router.get("/:username", getRecruiterProfile)

// ✏️ Update profile
router.put("/profile", requireAuth, updateRecruiterProfile)

export default router
