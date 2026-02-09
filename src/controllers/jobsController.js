import { prisma } from "../lib/prisma.js";

/**
 * Recruiter/Admin: create job
 */
export async function createJob(req, res) {
  try {
    if (!["recruiter", "admin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Not allowed" })
    }

    // 1️⃣ Fetch recruiter with company
    const recruiter = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { companyId: true },
    })

    if (!recruiter?.companyId) {
      return res.status(400).json({
        error: "Recruiter is not linked to any company",
      })
    }

    // 2️⃣ Create job with companyId from DB
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

        companyId: recruiter.companyId, // ✅ FIX
        postedById: req.user.userId,
      },
    })

    res.json(job)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Job creation failed" })
  }
}


/**
 * Public: list jobs (for feed)
 */
export async function getAllJobs(req, res) {
  try {
    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,       // ✅ REQUIRED
            logoUrl: true,    // (optional for later)
          },
        },
        postedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.json(jobs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch jobs" })
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

export async function getJobsByRecruiter(req, res) {
  try {
    const { username } = req.params

    const recruiter = await prisma.user.findUnique({
      where: { username },
    })

    if (!recruiter || recruiter.role !== "recruiter") {
      return res.json([])
    }

    const jobs = await prisma.job.findMany({
      where: {
        postedById: recruiter.id,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json(jobs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch recruiter jobs" })
  }
}

export async function getMyRecruiterJobs(req, res) {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Not allowed" })
    }

    const jobs = await prisma.job.findMany({
      where: {
        postedById: req.user.userId,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    })

    res.json(jobs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch recruiter jobs" })
  }
}


/**
 * Recruiter: dashboard stats + recent jobs
 */
export async function getRecruiterDashboard(req, res) {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Not allowed" })
    }

    const recruiterId = req.user.userId

    // 1️⃣ Jobs count
    const jobsCount = await prisma.job.count({
      where: {
        postedById: recruiterId,
        isActive: true,
      },
    })

    // 2️⃣ Applications count
    const applicationsCount = await prisma.application.count({
      where: {
        job: {
          postedById: recruiterId,
        },
      },
    })

    // 3️⃣ Shortlisted count
    const shortlistedCount = await prisma.application.count({
      where: {
        status: "shortlisted",
        job: {
          postedById: recruiterId,
        },
      },
    })

    // 4️⃣ Recent jobs (last 5)
    const recentJobsRaw = await prisma.job.findMany({
      where: {
        postedById: recruiterId,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })

    const recentJobs = recentJobsRaw.map(job => ({
      id: job.id,
      title: job.title,
      applications: job._count.applications,
    }))

    res.json({
      jobsCount,
      applicationsCount,
      shortlistedCount,
      recentJobs,
    })
  } catch (err) {
    console.error("Recruiter dashboard error:", err)
    res.status(500).json({ error: "Failed to load dashboard" })
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


/**
 * Admin: company-wise jobs with count
 */
export async function getAdminCompanyJobs(req, res) {
  try {
    const companies = await prisma.company.findMany({
      include: {
        jobs: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            jobs: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    })

    res.json(
      companies.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        jobsCount: c._count.jobs,
        jobs: c.jobs,
      }))
    )
  } catch (err) {
    console.error("Admin company jobs error:", err)
    res.status(500).json({ error: "Failed to fetch admin jobs" })
  }
}
