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

const router = express.Router();

router.get("/", getAllPosts);          // supports pagination & search via query params
router.get("/:id", getPostById);

// Protected routes
router.post("/", requireAuth, requireAdmin, createPost);
router.put("/:id", requireAuth, requireAdmin, updatePost);
router.delete("/:id", requireAuth, requireAdmin, deletePost);

export default router;
