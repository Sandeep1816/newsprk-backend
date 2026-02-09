import express from "express"
import { requireAuth, requireAdmin } from "../middleware/auth.js"
import {
  createJob,
  getAllJobs,
  getJobBySlug,
  deactivateJob,
  getJobsByRecruiter,
  getMyRecruiterJobs,
  getAdminCompanyJobs
} from "../controllers/jobsController.js"

const router = express.Router()

/* ================= PUBLIC ================= */

// Job feed
router.get("/", getAllJobs)

// Job detail
router.get("/:slug", getJobBySlug)

/* ================= RECRUITER ================= */

// ✅ MUST COME FIRST
router.get(
  "/recruiter/me",
  requireAuth,
  getMyRecruiterJobs
)

router.get(
  "/admin/company-jobs",
  requireAuth,
  requireAdmin,
  getAdminCompanyJobs
)

// Public recruiter profile jobs
router.get(
  "/recruiter/:username",
  getJobsByRecruiter
)

// Create job
router.post("/", requireAuth, createJob)

/* ================= ADMIN ================= */

router.put("/:id/deactivate", requireAuth, requireAdmin, deactivateJob)

export default router
