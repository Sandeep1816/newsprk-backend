import prisma from "../prismaClient.js"
import slugify from "slugify"

/**
 * CREATE recruiter article
 */
export const createRecruiterArticle = async (req, res) => {
  try {
    const user = req.user

    // 🔐 Recruiter guard
    if (!user || user.role !== "recruiter") {
      return res.status(403).json({ error: "Only recruiters can create articles" })
    }

    if (!user.companyId) {
      return res
        .status(400)
        .json({ error: "Recruiter must be linked to a company" })
    }

    const { title, content, excerpt, imageUrl, badge } = req.body

    if (!title || !content) {
      return res
        .status(400)
        .json({ error: "Title and content are required" })
    }

    // 🔒 Force category = articles
    const category = await prisma.category.findUnique({
      where: { slug: "articles" },
    })

    if (!category) {
      return res.status(500).json({
        error: "Articles category not found. Contact admin.",
      })
    }

    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    })

    const post = await prisma.post.create({
      data: {
    title,
    slug,
    content,
    excerpt,
    imageUrl,
    badge,
    companyId: user.companyId,
    categoryId: category.id,

    status: "PENDING",
    createdById: user.userId,

    // ❌ do NOT publish yet
    publishedAt: null,
  },
      include: {
        company: true,
        category: true,
      },
    })

    return res.status(201).json(post)
  } catch (error) {
    console.error("Create recruiter article error:", error)

    if (error?.code === "P2002") {
      return res.status(409).json({ error: "Slug must be unique" })
    }

    return res.status(500).json({ error: "Internal server error" })
  }
}

export const getMyRecruiterArticles = async (req, res) => {
  try {
    const user = req.user

    if (!user || user.role !== "recruiter") {
      return res.status(403).json({ error: "Only recruiters allowed" })
    }

    const posts = await prisma.post.findMany({
      where: {
        category: { slug: "articles" },
        OR: [
          { companyId: user.companyId }, // recruiter-owned
          { companyId: null },           // legacy/admin articles
        ],
      },
      orderBy: { createdAt: "desc" },
    })

    res.json(posts)
  } catch (error) {
    console.error("Fetch recruiter articles error:", error)
    res.status(500).json({ error: "Failed to fetch articles" })
  }
}



/**
 * UPDATE recruiter article (own only)
 */
export const updateRecruiterArticle = async (req, res) => {
  try {
    const user = req.user
    const postId = Number(req.params.id)

    if (!user || user.role !== "recruiter") {
      return res.status(403).json({ error: "Only recruiters allowed" })
    }

    if (!user.companyId) {
      return res.status(400).json({ error: "Recruiter not linked to company" })
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post || post.companyId !== user.companyId) {
      return res.status(404).json({ error: "Article not found" })
    }

    const { title, content, excerpt, imageUrl, badge } = req.body

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        excerpt,
        imageUrl,
        badge,
        ...(title && {
          slug: slugify(title, { lower: true, strict: true }),
        }),
        updatedAt: new Date(),
      },
      include: {
        company: true,
        category: true,
      },
    })

    return res.json(updatedPost)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

/**
 * DELETE recruiter article (own only)
 */
export const deleteRecruiterArticle = async (req, res) => {
  try {
    const user = req.user
    const postId = Number(req.params.id)

    if (!user || user.role !== "recruiter") {
      return res.status(403).json({ error: "Only recruiters allowed" })
    }

    if (!user.companyId) {
      return res.status(400).json({ error: "Recruiter not linked to company" })
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post || post.companyId !== user.companyId) {
      return res.status(404).json({ error: "Article not found" })
    }

    await prisma.post.delete({
      where: { id: postId },
    })

    return res.json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
