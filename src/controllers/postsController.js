// src/controllers/postsController.js
import prisma from "../prismaClient.js";

/**
 * GET /api/posts
 * Supports:
 * - ?page, ?limit
 * - ?q (search)
 * - ?category (slug)
 * - ?author (id)
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
                is: { slug: category },
              },
            }
          : {},
        author ? { authorId: author } : {},
      ],
    };

    where.AND = where.AND.filter((c) => Object.keys(c).length);

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

// GET /api/posts/:id
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

// GET /api/posts/slug/:slug
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await prisma.post.findUnique({
      where: { slug },
      include: { author: true, category: true, comments: true },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRecruiterArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const article = await prisma.post.findFirst({
      where: {
        slug,
        status: "APPROVED",
        publishedAt: { not: null },
        category: { slug: "articles" },
      },
      include: {
        company: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    if (!article) {
      return res.status(404).json({ error: "Article not found" })
    }

    res.json(article)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch article" })
  }
}


// GET /api/posts/featured
export const getFeaturedPosts = async (req, res) => {
  try {
    const trendingPosts = await prisma.post.findMany({
      where: { category: { slug: "trending" } },
      include: { author: true, category: true },
      orderBy: { publishedAt: "desc" },
      take: 2,
    });
    res.json({ data: trendingPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch featured posts" });
  }
};

// POST /api/posts
export const createPost = async (req, res) => {
  try {
    const {
      title,
      slug,
      badge,
      excerpt,
      content,
      imageUrl,
      authorId,
      categoryId,
      publishedAt,

      // ✅ NEW OPTIONAL FIELDS
      facebookUrl,
      linkedinUrl,
      twitterUrl,
      youtubeUrl,
      email,
      whatsappNumber,
    } = req.body;

    if (!title || !slug || !content || !authorId || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        badge,
        excerpt,
        content,
        imageUrl,

        // ✅ SAVE OPTIONAL FIELDS
        facebookUrl,
        linkedinUrl,
        twitterUrl,
        youtubeUrl,
        email,
        whatsappNumber,

        authorId: Number(authorId),
        categoryId: Number(categoryId),
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
      include: { author: true, category: true },
    });

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "Slug must be unique" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};


// PUT /api/posts/:id
export const updatePost = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;

    if (data.authorId) data.authorId = Number(data.authorId);
    if (data.categoryId) data.categoryId = Number(data.categoryId);

    const updated = await prisma.post.update({
      where: { id },
      data, // ✅ includes facebookUrl, twitterUrl, etc automatically
      include: { author: true, category: true },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};


// DELETE /api/posts/:id
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

export const incrementPostView = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    res.json({ success: true, views: post.views });
  } catch (err) {
    console.error("View increment error:", err);
    res.status(404).json({ success: false, message: "Post not found" });
  }
};


export const incrementPostShare = async (req, res) => {
  try {
    const { slug } = req.params

    await prisma.post.update({
      where: { slug },
      data: {
        shares: { increment: 1 },
      },
    })

    res.json({ success: true })
  } catch (err) {
    console.error("Share increment error:", err)
    res.status(500).json({ error: "Failed to increment share" })
  }
}
