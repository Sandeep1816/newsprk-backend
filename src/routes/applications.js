import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  applyJob,
  getMyApplications,
  getApplicantsByJob,
  updateApplicationStatus
} from "../controllers/jobApplicationsController.js";

const router = express.Router();

// Candidate
router.post("/", requireAuth, applyJob);
router.get("/me", requireAuth, getMyApplications);

// Recruiter
router.get("/job/:jobId", requireAuth, getApplicantsByJob)
router.put("/:applicationId/status", requireAuth, updateApplicationStatus)


export default router;
