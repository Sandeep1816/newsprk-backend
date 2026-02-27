import express from "express"
import { requireAuth } from "../middleware/auth.js"
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  getMyRecruiterProfile,
  getRecruiterDashboard,
  getRecruitersByCompany,
  getAllRecruiters
} from "../controllers/recruitersController.js"

const router = express.Router()

// 🔐 Logged-in recruiter
router.get("/me", requireAuth, getMyRecruiterProfile)

// 📊 Recruiter dashboard
// router.get("/dashboard", requireAuth, getRecruiterDashboard)

// ✅ Admin get all recruiters (MOVE THIS UP)
router.get("/admin", requireAuth, getAllRecruiters)

// Company filter
router.get("/", requireAuth, getRecruitersByCompany)

// 🌍 Public recruiter profile (MUST BE LAST)
router.get("/:username", getRecruiterProfile)

// ✏️ Update profile
router.put("/profile", requireAuth, updateRecruiterProfile)

export default router

