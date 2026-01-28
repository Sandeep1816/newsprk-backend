import prisma from "../prismaClient.js"

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
        tradeNames,     // Json
        videoGallery,   // Json
        status: "PENDING",
        isLiveEditable: false,
        submittedById: user.userId,
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

    if (directory.submittedById !== user.userId) {
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
      slug,
    } = req.body

    // 🚫 Slug is locked forever
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
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "DIRECTORY_UPDATED_LIVE",
        entity: "SupplierDirectory",
        entityId: updated.id,
        userId: user.userId,
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

  const supplier = await prisma.supplierDirectory.findFirst({
    where: {
      slug,
      status: "APPROVED",
    },
  })

  if (!supplier) {
    return res.status(404).json({ error: "Supplier not found" })
  }

  res.json(supplier)
}
