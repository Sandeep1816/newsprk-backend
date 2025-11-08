import express from "express";
import { getAuthors, createAuthor } from "../controllers/authorsController.js";

const router = express.Router();

router.get("/", getAuthors);
router.post("/", createAuthor); // ✅ Add POST route

export default router;
