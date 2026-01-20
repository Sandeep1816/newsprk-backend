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
router.get("/:slug", getJobBySlug);

// Recruiter
router.post("/", requireAuth, createJob);
router.get("/recruiter/:username", getJobsByRecruiter)

// Admin
router.put("/:id/deactivate", requireAuth, requireAdmin, deactivateJob);

export default router;
