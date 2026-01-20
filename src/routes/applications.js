import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  applyJob,
  getMyApplications,
} from "../controllers/jobApplicationsController.js";

const router = express.Router();

// Candidate
router.post("/", requireAuth, applyJob);
router.get("/me", requireAuth, getMyApplications);

export default router;
