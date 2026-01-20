
// src/routes/posts.js
import express from "express";
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postsController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js"; // 👈 ADD THIS

const router = express.Router();

// PUBLIC ROUTES
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// 🔥 ADD THIS ROUTE (BEFORE protected routes)
router.post("/slug/:slug/view", async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await prisma.post.update({
      where: { slug },
      data: {
        views: { increment: 1 },
      },
      select: { views: true },
    });

    res.json({ success: true, views: post.views });
  } catch (err) {
    console.error("View increment error:", err);
    res.status(404).json({ success: false, message: "Post not found" });
  }
});

// PROTECTED ROUTES
router.post("/", requireAuth, requireAdmin, createPost);
router.put("/:id", requireAuth, requireAdmin, updatePost);
router.delete("/:id", requireAuth, requireAdmin, deletePost);

export default router;
