import prisma from "../prismaClient.js";

// Get all comments
export const getComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      include: { post: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new comment
export const addComment = async (req, res) => {
  try {
    const { postId, name, email, content } = req.body;
    const comment = await prisma.comment.create({
      data: { postId: Number(postId), name, email, content },
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
