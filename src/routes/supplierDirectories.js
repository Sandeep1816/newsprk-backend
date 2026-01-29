import express from "express"
import {
  createDirectory,
  approveDirectory,
  updateDirectory,
  getSuppliers,
  getSupplierBySlug,
  getMyDirectories,
  getMyDirectoryById,
} from "../controllers/supplierDirectoryController.js"

import { requireAuth, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Recruiter
router.post("/", requireAuth, createDirectory)
router.put("/:id", requireAuth, updateDirectory)
router.get(
  "/recruiter/directories",
  requireAuth,
  getMyDirectories
)

// Admin
router.patch("/admin/:id/approve", requireAuth, requireAdmin, approveDirectory)

// Recruiter
router.get(
  "/recruiter/directories/:id",
  requireAuth,
  getMyDirectoryById
)

// Public
router.get("/", getSuppliers)
router.get("/:slug", getSupplierBySlug)

export default router
