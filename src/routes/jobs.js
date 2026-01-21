import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  createJob,
  getAllJobs,
  getJobBySlug,
  deactivateJob,
  getJobsByRecruiter,
} from "../controllers/jobsController.js";

const router = express.Router();

// Public
router.get("/", getAllJobs);

// Recruiter (⚠️ MUST COME BEFORE :slug)
router.get("/recruiter/:username", getJobsByRecruiter);

// Public
router.get("/:slug", getJobBySlug);

// Recruiter
router.post("/", requireAuth, createJob);

// Admin
router.put("/:id/deactivate", requireAuth, requireAdmin, deactivateJob);

export default router;
