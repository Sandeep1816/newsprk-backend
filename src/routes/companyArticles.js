import { Router } from "express"
import { getCompanyArticles } from "../controllers/companyArticlesController.js"

const router = Router()

router.get("/:companyId/articles", getCompanyArticles)

export default router
