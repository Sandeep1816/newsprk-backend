import prisma from "../prismaClient.js"

export async function getPendingDirectories(req, res) {
  if (req.user.role?.toLowerCase() !== "admin") {
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
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ error: "Admin only" })
  }

  const directoryId = Number(req.params.id)

  const directory = await prisma.supplierDirectory.findUnique({
    where: { id: directoryId },
    include: {
      submittedBy: {
        select: { id: true, email: true, fullName: true },
      },
    },
  })

  if (!directory) {
    return res.status(404).json({ error: "Directory not found" })
  }

  res.json(directory)
}

export async function approveDirectory(req, res) {
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ error: "Admin only" })
  }

  const directoryId = Number(req.params.id)

  const directory = await prisma.supplierDirectory.update({
    where: { id: directoryId },
    data: {
      status: "APPROVED",
      isLiveEditable: true,
      approvedById: req.user.userId ?? req.user.id,
      approvedAt: new Date(),
    },
  })

  await prisma.auditLog.create({
    data: {
      action: "DIRECTORY_APPROVED",
      entity: "SupplierDirectory",
      entityId: directory.id,
      userId: req.user.userId ?? req.user.id,
    },
  })

  res.json({ message: "Directory approved", directory })
}

export async function rejectDirectory(req, res) {
  if (req.user.role?.toLowerCase() !== "admin") {
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
      userId: req.user.userId ?? req.user.id,
    },
  })

  res.json({ message: "Directory rejected" })
}

export async function adminCreateDirectory(req, res) {
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  const {
    name,
    slug,
    description,
    companyId,
    submittedById,
  } = req.body;

  const directory = await prisma.supplierDirectory.create({
    data: {
      name,
      slug,
      description,
      companyId: Number(companyId),
      submittedById: Number(submittedById),
      status: "APPROVED",
      isLiveEditable: true,
      approvedById: req.user.userId ?? req.user.id,
      approvedAt: new Date(),
    },
  });

  res.status(201).json(directory);
}
