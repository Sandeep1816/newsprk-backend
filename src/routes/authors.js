import express from "express";
import { getAuthors } from "../controllers/authorsController.js";

const router = express.Router();
router.get("/", getAuthors);
export default router;
