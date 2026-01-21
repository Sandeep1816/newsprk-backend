import express from "express"
import { requireAuth } from "../middleware/auth.js"
import { getRecruiterDashboard } from "../controllers/recruiterDashboardController.js"

const router = express.Router()

router.get("/dashboard", requireAuth, getRecruiterDashboard)

export default router
