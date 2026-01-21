import express from "express"
import { requireAuth } from "../middleware/auth.js"
import { getRecruiterProfile, updateRecruiterProfile } from "../controllers/recruitersController.js"

const router = express.Router()

// PUBLIC recruiter profile
router.get("/:username", getRecruiterProfile)
router.put("/profile", requireAuth, updateRecruiterProfile)

export default router
