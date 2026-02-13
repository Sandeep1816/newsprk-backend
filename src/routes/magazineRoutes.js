import express from "express";
import {
  createMagazine,
  updateMagazine,
  deleteMagazine,
  getAllMagazines,
  getSingleMagazine,
  getMagazineRegistrations,
  registerMagazine
} from "../controllers/magazineController.js";

import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/* ================= ADMIN ================= */
router.post("/", requireAuth, requireAdmin, createMagazine);
router.put("/:id", requireAuth, requireAdmin, updateMagazine);
router.delete("/:id", requireAuth, requireAdmin, deleteMagazine);
router.get("/:id/registrations", requireAuth, requireAdmin, getMagazineRegistrations);

/* ================= PUBLIC ================= */
router.get("/", getAllMagazines);
router.get("/:slug", getSingleMagazine);
router.post("/:magazineId/register", registerMagazine);

export default router;
