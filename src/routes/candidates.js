import express from "express"
import { getCandidateProfile, onboardCandidate } from "../controllers/candidatesController.js"
import { requireAuth } from "../middleware/auth.js"
const router = express.Router()

router.get("/:username", getCandidateProfile)

router.post("/onboarding", requireAuth, onboardCandidate)

export default router
