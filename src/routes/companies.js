import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  createCompany,
  getAllCompanies,
  verifyCompany,
} from "../controllers/companiesController.js";

const router = express.Router();

// Public
router.get("/", getAllCompanies);

// Recruiter
router.post("/", requireAuth, createCompany);

// Admin
router.put("/:id/verify", requireAuth, requireAdmin, verifyCompany);

export default router;
