import { Router } from "express"
import { getApprovedArticles } from "../controllers/publicController.js"

const router = Router()

/**
 * 🌍 PUBLIC ROUTES
 */
router.get("/articles/approved", getApprovedArticles)

export default router
