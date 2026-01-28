import prisma from "../prismaClient.js"

export async function getPendingDirectories(req, res) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" })
  }

 const directories = await prisma.supplierDirectory.findMany({
  where: {
    status: "PENDING",
  },
  orderBy: { createdAt: "asc" },
  include: {
    submittedBy: {
      select: { id: true, email: true, fullName: true },
    },
  },
})


  res.json(directories)
}

export async function getDirectoryForReview(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin only" })
    }

    const directoryId = Number(req.params.id)

    const directory = await prisma.supplierDirectory.findUnique({
      where: { id: directoryId },
      include: {
        submittedBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    })

    if (!directory) {
      return res.status(404).json({ error: "Directory not found" })
    }

    res.json(directory)
  } catch (err) {
    console.error("Admin directory review error:", err)
    res.status(500).json({ error: "Failed to load directory" })
  }
}


export async function approveDirectory(req, res) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" })
  }

  const directoryId = Number(req.params.id)

  const directory = await prisma.supplierDirectory.update({
    where: { id: directoryId },
    data: {
      status: "APPROVED",
      isLiveEditable: true,
      approvedById: req.user.userId,
      approvedAt: new Date(),
    },
  })

  await prisma.auditLog.create({
    data: {
      action: "DIRECTORY_APPROVED",
      entity: "SupplierDirectory",
      entityId: directory.id,
      userId: req.user.userId,
    },
  })

  res.json({ message: "Directory approved", directory })
}


export async function rejectDirectory(req, res) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" })
  }

  const directoryId = Number(req.params.id)

  await prisma.supplierDirectory.update({
    where: { id: directoryId },
    data: { status: "REJECTED" },
  })

  await prisma.auditLog.create({
    data: {
      action: "DIRECTORY_REJECTED",
      entity: "SupplierDirectory",
      entityId: directoryId,
      userId: req.user.userId,
    },
  })

  res.json({ message: "Directory rejected" })
}
