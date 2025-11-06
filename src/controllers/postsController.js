// src/controllers/postsController.js
import prisma from "../prismaClient.js";

/**
 * Query params:
 * - page (default 1)
 * - limit (default 10)
 * - q (search string, searches title/excerpt/content)
 * - category (category slug)
 * - author (author id)
 */
export const getAllPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "10")));
    const q = req.query.q || "";
    const category = req.query.category || null;
    const author = req.query.author ? Number(req.query.author) : null;

    const where = {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { excerpt: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        category
          ? {
              category: {
                is: {
                  slug: category,
                },
              },
            }
          : {},
        author
          ? {
              authorId: author,
            }
          : {},
      ],
    };

    // Remove empty objects because Prisma doesn't accept empty object in AND
    where.AND = where.AND.filter((c) => Object.keys(c).length !== 0);

    const [data, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: { author: true, category: true },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      data,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true, category: true, comments: true },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, slug, excerpt, content, imageUrl, authorId, categoryId, publishedAt } = req.body;
    if (!title || !slug || !content || !authorId || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        imageUrl,
        authorId: Number(authorId),
        categoryId: Number(categoryId),
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
      include: { author: true, category: true },
    });
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    // Handle uniqueness error for slug
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "Slug must be unique" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    if (data.authorId) data.authorId = Number(data.authorId);
    if (data.categoryId) data.categoryId = Number(data.categoryId);
    const updated = await prisma.post.update({
      where: { id },
      data,
      include: { author: true, category: true },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.post.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
