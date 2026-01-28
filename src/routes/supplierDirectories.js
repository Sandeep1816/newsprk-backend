import express from "express"
import {
  createDirectory,
  approveDirectory,
  updateDirectory,
  getSuppliers,
  getSupplierBySlug,
} from "../controllers/supplierDirectoryController.js"

import { requireAuth, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Recruiter
router.post("/", requireAuth, createDirectory)
router.put("/:id", requireAuth, updateDirectory)

// Admin
router.patch("/admin/:id/approve", requireAuth, requireAdmin, approveDirectory)

// Public
router.get("/", getSuppliers)
router.get("/:slug", getSupplierBySlug)

export default router
