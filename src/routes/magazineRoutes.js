import express from "express";
import {
  createMagazine,
  updateMagazine,
  deleteMagazine,
  getAllMagazines,
  getSingleMagazine,
  getMagazineRegistrations,
  registerMagazine,
  getMagazineCreationData,

  // NEW
  createMagazineAuthor,
  getAllMagazineAuthors,
  createCoverStory,
  getAllCoverStories,
  getSingleCoverStory,
  getAllMagazinesAdmin
} from "../controllers/magazineController.js";

import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/* ================= MAGAZINE ================= */

router.post("/", requireAuth, requireAdmin, createMagazine);
router.put("/:id", requireAuth, requireAdmin, updateMagazine);
router.delete("/:id", requireAuth, requireAdmin, deleteMagazine);
router.get("/:id/registrations", requireAuth, requireAdmin, getMagazineRegistrations);
router.get("/creation-data", requireAuth, requireAdmin, getMagazineCreationData);


router.get("/admin", requireAuth, requireAdmin, getAllMagazinesAdmin);
router.get("/", getAllMagazines);
router.get("/:slug", getSingleMagazine);
router.post("/:magazineId/register", registerMagazine);

/* ================= AUTHORS ================= */

router.post("/authors", requireAuth, requireAdmin, createMagazineAuthor);
router.get("/authors", getAllMagazineAuthors);

/* ================= COVER STORIES ================= */

router.post("/cover-stories", requireAuth, requireAdmin, createCoverStory);
router.get("/cover-stories", getAllCoverStories);
router.get("/cover-stories/:slug", getSingleCoverStory);

export default router;
