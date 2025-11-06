import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import postsRoutes from "./routes/posts.js";
import authorsRoutes from "./routes/authors.js";
import categoriesRoutes from "./routes/categories.js";
import commentsRoutes from "./routes/comments.js";
import authRoutes from "./routes/auth.js";
import { requireAuth, requireAdmin } from "./middleware/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🏠 Default route
app.get("/", (req, res) => {
  res.json({ message: "✅ Newsprk backend running" });
});

// 🔗 Mount routes
app.use("/api/posts", postsRoutes);
app.use("/api/authors", authorsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/authors", authorsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/comments", commentsRoutes);

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
