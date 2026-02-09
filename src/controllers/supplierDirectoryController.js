import prisma from "../prismaClient.js"

/**
 * Recruiter submits directory (FIRST TIME)
 */
/**
 * Recruiter submits directory (FIRST TIME)
 */
export const createDirectory = async (req, res) => {
  try {
    const user = req.user

    if (user.role !== "recruiter") {
      return res.status(403).json({ error: "Only recruiters can submit directories" })
    }

    const {
      name,
      slug,
      description,
      website,
      logoUrl,
      coverImageUrl,
      phoneNumber,
      email,
      tradeNames,
      videoGallery,
      socialLinks,
      productSupplies,
    } = req.body

    const directory = await prisma.supplierDirectory.create({
      data: {
        name,
        slug,
        description,
        website,
        logoUrl,
        coverImageUrl,
        phoneNumber,
        email,
        tradeNames,
        videoGallery,
        socialLinks,
        productSupplies,

        companyId: user.companyId,
        status: "PENDING",
        isLiveEditable: false,

        // ✅ FIX
        submittedById: user.id,
      },
    })

    res.status(201).json(directory)
  } catch (err) {
    console.error("Create directory error:", err)
    res.status(500).json({ error: "Failed to create directory" })
  }
}

/**
 * Admin approves directory (ONLY ONCE)
 */
export const approveDirectory = async (req, res) => {
  try {
    const user = req.user

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin only" })
    }

    const directoryId = Number(req.params.id)

    const directory = await prisma.supplierDirectory.update({
      where: { id: directoryId },
      data: {
        status: "APPROVED",
        isLiveEditable: true,
        approvedById: user.id,
        approvedAt: new Date(),
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "DIRECTORY_APPROVED",
        entity: "SupplierDirectory",
        entityId: directory.id,
        userId: user.id,
      },
    })

    res.json(directory)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Approval failed" })
  }
}

/**
 * Get single recruiter directory by ID
 */
export const getMyDirectoryById = async (req, res) => {
  try {
    const user = req.user
    const directoryId = Number(req.params.id)

    if (user.role !== "recruiter") {
      return res.status(403).json({ error: "Not allowed" })
    }

    const directory = await prisma.supplierDirectory.findFirst({
      where: {
        id: directoryId,
        submittedById: user.id, // ✅ FIX
      },
    })

    if (!directory) {
      return res.status(404).json({ error: "Directory not found" })
    }

    res.json(directory)
  } catch (err) {
    console.error("Get directory by id error:", err)
    res.status(500).json({ error: "Failed to load directory" })
  }
}

/**
 * Get recruiter directories
 */
export const getMyDirectories = async (req, res) => {
  try {
    const user = req.user

    if (user.role !== "recruiter") {
      return res.status(403).json({ error: "Not allowed" })
    }

    const directories = await prisma.supplierDirectory.findMany({
      where: {
        submittedById: user.id, // ✅ FIX
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        isLiveEditable: true,
        createdAt: true,
      },
    })

    res.json(directories)
  } catch (err) {
    console.error("Get recruiter directories error:", err)
    res.status(500).json({ error: "Failed to load directories" })
  }
}

/**
 * Recruiter updates directory (LIVE after approval)
 */
export const updateDirectory = async (req, res) => {
  try {
    const user = req.user
    const directoryId = Number(req.params.id)

    const directory = await prisma.supplierDirectory.findUnique({
      where: { id: directoryId },
    })

    if (!directory) {
      return res.status(404).json({ error: "Directory not found" })
    }

    if (directory.submittedById !== user.id) { // ✅ FIX
      return res.status(403).json({ error: "Not allowed" })
    }

    if (!directory.isLiveEditable) {
      return res.status(400).json({ error: "Directory not approved yet" })
    }

    const {
      name,
      description,
      website,
      logoUrl,
      coverImageUrl,
      phoneNumber,
      email,
      tradeNames,
      videoGallery,
      socialLinks,
      productSupplies,
      slug,
    } = req.body

    if (slug && slug !== directory.slug) {
      return res.status(400).json({ error: "Slug cannot be changed" })
    }

    const updated = await prisma.supplierDirectory.update({
      where: { id: directoryId },
      data: {
        name,
        description,
        website,
        logoUrl,
        coverImageUrl,
        phoneNumber,
        email,
        tradeNames,
        videoGallery,
        socialLinks,
        productSupplies,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "DIRECTORY_UPDATED_LIVE",
        entity: "SupplierDirectory",
        entityId: updated.id,
        userId: user.id, // ✅ FIX
      },
    })

    res.json(updated)
  } catch (err) {
    console.error("Update directory error:", err)
    res.status(500).json({ error: "Update failed" })
  }
}

/**
 * Get all approved suppliers
 */
export const getSuppliers = async (_req, res) => {
  const suppliers = await prisma.supplierDirectory.findMany({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" },
  })

  res.json(suppliers)
}

/**
 * Get supplier showroom
 */
export const getSupplierBySlug = async (req, res) => {
  const { slug } = req.params

  const supplier = await prisma.supplierDirectory.update({
    where: { slug },
    data: {
      views: { increment: 1 }, // 👁️ +1 view
    },
  })

  if (!supplier || supplier.status !== "APPROVED") {
    return res.status(404).json({ error: "Supplier not found" })
  }

  res.json(supplier)
}


/**
 * ADMIN: Get all directories (for review & management)
 */
export const getAllDirectoriesForAdmin = async (req, res) => {
  try {
    const directories = await prisma.supplierDirectory.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    res.json(directories)
  } catch (err) {
    console.error("Admin fetch directories error:", err)
    res.status(500).json({ error: "Failed to fetch directories" })
  }
}
