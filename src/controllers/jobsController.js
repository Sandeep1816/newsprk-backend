import { prisma } from "../lib/prisma.js";

/**
 * Recruiter/Admin: create job
 */
export async function createJob(req, res) {
  try {
    if (!["recruiter", "admin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const job = await prisma.job.create({
      data: {
        title: req.body.title,
        slug: req.body.slug,
        description: req.body.description,
        employmentType: req.body.employmentType,
        experience: req.body.experience,
        salaryRange: req.body.salaryRange,
        location: req.body.location,
        isRemote: req.body.isRemote ?? false,
        companyId: req.body.companyId,
        postedById: req.user.userId,
      },
    });

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Job creation failed" });
  }
}

/**
 * Public: list jobs
 */
export async function getAllJobs(req, res) {
  try {
    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      include: {
        company: true,
        postedBy: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
}

/**
 * Public: job detail by slug
 */
export async function getJobBySlug(req, res) {
  try {
    const job = await prisma.job.findUnique({
      where: { slug: req.params.slug },
      include: {
        company: true,
        postedBy: { select: { id: true, email: true } },
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
}

/**
 * Admin: deactivate job (soft delete)
 */
export async function deactivateJob(req, res) {
  try {
    const job = await prisma.job.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });

    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ error: "Failed to deactivate job" });
  }
}
