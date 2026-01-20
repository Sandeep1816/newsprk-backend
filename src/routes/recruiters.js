import express from "express"
import { getRecruiterProfile } from "../controllers/recruitersController.js"

const router = express.Router()

// PUBLIC recruiter profile
router.get("/:username", getRecruiterProfile)

export default router
