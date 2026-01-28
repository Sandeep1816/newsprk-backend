import { prisma } from "../lib/prisma.js"

export async function getRecruiterProfile(req, res) {
  try {
    const { username } = req.params

    const recruiter = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        headline: true,
        about: true,
        location: true,
        avatarUrl: true,
        websiteUrl: true,
        role: true,
        createdAt: true,
      },
    })

    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter not found" })
    }

    // Optional safety: only recruiters
    if (recruiter.role !== "recruiter") {
      return res.status(403).json({ error: "Not a recruiter profile" })
    }

    res.json(recruiter)
  } catch (err) {
    console.error("Recruiter profile error:", err)
    res.status(500).json({ error: "Failed to fetch recruiter profile" })
  }
}

export async function getMyRecruiterProfile(req, res) {
  try {
    const userId = req.user.userId

    const recruiter = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        headline: true,
        about: true,
        location: true,
        avatarUrl: true,
        websiteUrl: true,
        role: true,
        createdAt: true,
      },
    })

    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter not found" })
    }

    if (recruiter.role !== "recruiter") {
      return res.status(403).json({ error: "Not a recruiter" })
    }

    res.json(recruiter)
  } catch (err) {
    console.error("My recruiter profile error:", err)
    res.status(500).json({ error: "Failed to fetch recruiter profile" })
  }
}

export async function getRecruiterDashboard(req, res) {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Not allowed" })
    }

    const recruiterId = req.user.userId

    // ✅ ACTIVE JOBS
    const jobsCount = await prisma.job.count({
      where: {
        postedById: recruiterId,
        isActive: true,
      },
    })

    // ✅ APPLICATIONS COUNT (FIXED)
    const applicationsCount = await prisma.jobApplication.count({
      where: {
        job: {
          postedById: recruiterId,
        },
      },
    })

    // ✅ SHORTLISTED (OPTIONAL)
    const shortlistedCount = await prisma.jobApplication.count({
      where: {
        status: "shortlisted",
        job: {
          postedById: recruiterId,
        },
      },
    })

    // ✅ RECENT JOBS
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
          select: { applications: true },
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


export async function updateRecruiterProfile(req, res) {
  try {
    const userId = req.user.userId
    const { fullName, headline, companyId } = req.body

    const recruiter = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        headline,
        companyId, // ✅ THIS IS THE FIX
      },
    })

    res.json(recruiter)
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" })
  }
}


