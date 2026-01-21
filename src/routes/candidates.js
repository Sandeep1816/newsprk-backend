import express from "express"
import { getCandidateProfile } from "../controllers/candidatesController.js"

const router = express.Router()

router.get("/:username", getCandidateProfile)

export default router
