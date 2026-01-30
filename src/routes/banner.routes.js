import express from "express";
import {
  createBanner,
  getBannersByPlacement,
  getAllBanners,
  updateBanner,
  updateBannerOrder,
  deleteBanner,
  trackImpression,
  trackClick,
} from "../controllers/banner.controller.js";

import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * =========================
 * PUBLIC ROUTES
 * =========================
 */
router.get("/", getBannersByPlacement);
router.post("/:id/impression", trackImpression);
router.get("/:id/click", trackClick);

/**
 * =========================
 * ADMIN ROUTES
 * =========================
 */
router.post("/", requireAuth, requireAdmin, createBanner);
router.get("/admin/all", requireAuth, requireAdmin, getAllBanners);

// 🔥 DRAG & DROP ORDER UPDATE
router.put(
  "/reorder",
  requireAuth,
  requireAdmin,
  updateBannerOrder
);

router.put("/:id", requireAuth, requireAdmin, updateBanner);
router.delete("/:id", requireAuth, requireAdmin, deleteBanner);

export default router;
