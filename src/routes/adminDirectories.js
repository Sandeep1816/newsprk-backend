import express from "express"
import {
  getPendingDirectories,
  getDirectoryForReview,
  approveDirectory,
  rejectDirectory,
  adminCreateDirectory
} from "../controllers/adminDirectoryController.js"

import { requireAuth, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

router.get("/directories/pending", requireAuth, requireAdmin, getPendingDirectories)
router.get("/directories/:id", requireAuth, requireAdmin, getDirectoryForReview)
router.patch("/directories/:id/approve", requireAuth, requireAdmin, approveDirectory)
router.patch("/directories/:id/reject", requireAuth, requireAdmin, rejectDirectory)
router.post("/create-directory", requireAuth, adminCreateDirectory);


export default router
