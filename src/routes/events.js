import express from "express"
import {
  createEvent,
  publishEvent,
  getUpcomingEvents,
  getEventBySlug,
  getAllEventsAdmin,
  updateEvent,
  incrementEventView
} from "../controllers/eventsController.js"

import { requireAuth, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

/**
 * 🔐 ADMIN ROUTES (FIRST)
 */
router.post("/", requireAuth, requireAdmin, createEvent)
router.get("/admin/all", requireAuth, requireAdmin, getAllEventsAdmin)
router.put("/:id", requireAuth, requireAdmin, updateEvent) 
router.put("/publish/:id", requireAuth, requireAdmin, publishEvent)

/**
 * 🌍 PUBLIC ROUTES (LAST)
 */
router.post("/:slug/view", incrementEventView)
router.get("/", getUpcomingEvents)
router.get("/:slug", getEventBySlug)

export default router
