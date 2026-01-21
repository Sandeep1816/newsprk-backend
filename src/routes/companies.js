import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  createCompany,
  getAllCompanies,
  getCompanyBySlug,
  verifyCompany,
  getCompanyPeople,
  followCompany,
  unfollowCompany
} from "../controllers/companiesController.js";

const router = express.Router();

// Public
router.get("/", getAllCompanies);
router.get("/:slug", getCompanyBySlug); // 👈 MUST be before admin routes
router.get("/:slug/people", getCompanyPeople)

router.post("/:companyId/follow", requireAuth, followCompany)
router.delete("/:companyId/follow", requireAuth, unfollowCompany)

// Recruiter
router.post("/", requireAuth, createCompany);

// Admin
router.put("/:id/verify", requireAuth, requireAdmin, verifyCompany);

export default router;
