import prisma from "../prismaClient.js"
import bcrypt from "bcrypt";
import slugify from "slugify";

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
    logoUrl,
    companyId,
    submittedById,
  } = req.body;

  const directory = await prisma.supplierDirectory.create({
    data: {
      name,
      slug,
      description,
      logoUrl,
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


export async function adminCreateFullSetup(req, res) {
  if (req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  const { company, recruiter, directory } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {

      /* =============================
         1️⃣ CREATE COMPANY
      ============================== */

      let companySlug = slugify(company.name, { lower: true, strict: true });

      const existingCompany = await tx.company.findUnique({
        where: { slug: companySlug },
      });

      if (existingCompany) {
        companySlug = `${companySlug}-${Date.now()}`;
      }

      const newCompany = await tx.company.create({
        data: {
          name: company.name,
          slug: companySlug,
          description: company.description,
          website: company.website,
          location: company.location,
          industry: company.industry,
          logoUrl: company.logoUrl,
          isVerified: true,
        },
      });

      /* =============================
         2️⃣ CREATE RECRUITER
      ============================== */

      const hashedPassword = await bcrypt.hash(recruiter.password, 10);

      const newRecruiter = await tx.user.create({
        data: {
          email: recruiter.email,
          username: recruiter.username,
          password: hashedPassword,
          role: "recruiter",
          fullName: recruiter.fullName,
          companyId: newCompany.id,
          emailVerified: true,
        },
      });

      /* =============================
         3️⃣ CREATE DIRECTORY
      ============================== */

      let directorySlug = slugify(directory.name, { lower: true, strict: true });

      const existingDirectory = await tx.supplierDirectory.findUnique({
        where: { slug: directorySlug },
      });

      if (existingDirectory) {
        directorySlug = `${directorySlug}-${Date.now()}`;
      }

     const newDirectory = await tx.supplierDirectory.create({
  data: {
    name: directory.name,
    slug: directorySlug,
    description: directory.description,
    website: directory.website,
    phoneNumber: directory.phoneNumber,
    email: directory.email,
    logoUrl: directory.logoUrl,
    location: directory.location,
    industry: directory.industry,

    // ✅ ADD THESE
    videoGallery: directory.videoGallery || [],
    socialLinks: directory.socialLinks || {},

    companyId: newCompany.id,
    submittedById: newRecruiter.id,

    status: "APPROVED",
    isLiveEditable: true,
    approvedById: req.user.userId ?? req.user.id,
    approvedAt: new Date(),
  },
});

      /* =============================
         4️⃣ AUDIT LOG
      ============================== */

      await tx.auditLog.create({
        data: {
          action: "FULL_DIRECTORY_CREATED",
          entity: "SupplierDirectory",
          entityId: newDirectory.id,
          userId: req.user.userId ?? req.user.id,
        },
      });

      return {
        company: newCompany,
        recruiter: newRecruiter,
        directory: newDirectory,
      };
    });

    res.status(201).json(result);

  } catch (error) {
    console.error("FULL SETUP ERROR:", error);
    res.status(500).json({ error: "Failed to create full setup" });
  }
}