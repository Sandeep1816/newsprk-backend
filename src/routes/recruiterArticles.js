import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import {
  createRecruiterArticle,
  updateRecruiterArticle,
  deleteRecruiterArticle,
  getMyRecruiterArticles, // ✅ ADD THIS
} from "../controllers/recruiterArticle.js"

const router = Router()

// ✅ LIST recruiter articles
router.get("/articles", requireAuth, getMyRecruiterArticles)

// ✅ CREATE
router.post("/articles", requireAuth, createRecruiterArticle)

// ✅ UPDATE
router.put("/articles/:id", requireAuth, updateRecruiterArticle)

// ✅ DELETE
router.delete("/articles/:id", requireAuth, deleteRecruiterArticle)

export default router
