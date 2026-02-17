import express from "express";
import { adminCreateRecruiter } from "../controllers/adminUserController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-recruiter", requireAuth, adminCreateRecruiter);

export default router;
