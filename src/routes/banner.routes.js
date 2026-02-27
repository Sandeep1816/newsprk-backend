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
  getBannerById,
} from "../controllers/banner.controller.js";

import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * =========================
 * PUBLIC ROUTES
 * =========================
 */

// 🔥 SPECIFIC PUBLIC ROUTES FIRST
router.get("/:id/click", trackClick);
router.post("/:id/impression", trackImpression);

// 🔥 THEN GENERIC
router.get("/", getBannersByPlacement);

/**
 * =========================
 * ADMIN ROUTES
 * =========================
 */

// 🔥 MOST SPECIFIC FIRST
router.get("/admin/all", requireAuth, requireAdmin, getAllBanners);
router.put("/reorder", requireAuth, requireAdmin, updateBannerOrder);

// 🔥 THEN PARAM ROUTES
router.post("/", requireAuth, requireAdmin, createBanner);
router.get("/:id", requireAuth, requireAdmin, getBannerById);
router.put("/:id", requireAuth, requireAdmin, updateBanner);
router.delete("/:id", requireAuth, requireAdmin, deleteBanner);

export default router;