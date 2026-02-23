

import { prisma } from "../lib/prisma.js"

// ================= PUBLIC RECRUITER PROFILE =================
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

    if (recruiter.role !== "recruiter") {
      return res.status(403).json({ error: "Not a recruiter profile" })
    }

    res.json(recruiter)
  } catch (err) {
    console.error("Recruiter profile error:", err)
    res.status(500).json({ error: "Failed to fetch recruiter profile" })
  }
}

// ================= MY RECRUITER PROFILE =================
export async function getMyRecruiterProfile(req, res) {
  try {
    const userId = req.user.id // ✅ FIXED

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
        company: true, // optional, useful
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

// ================= RECRUITER DASHBOARD =================
export async function getRecruiterDashboard(req, res) {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Not allowed" })
    }

    const recruiterId = req.user.id // ✅ FIXED

    const jobsCount = await prisma.job.count({
      where: {
        postedById: recruiterId,
        isActive: true,
      },
    })

    const applicationsCount = await prisma.jobApplication.count({
      where: {
        job: {
          postedById: recruiterId,
        },
      },
    })

    const shortlistedCount = await prisma.jobApplication.count({
      where: {
        status: "shortlisted",
        job: {
          postedById: recruiterId,
        },
      },
    })

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

// ================= UPDATE RECRUITER PROFILE =================
export async function updateRecruiterProfile(req, res) {
  try {
    const userId = req.user.id
    const { fullName, headline, about, location, websiteUrl, avatarUrl, companyId } = req.body

    const recruiter = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        headline,
        about,
        location,
        websiteUrl,
        avatarUrl,  // ✅ this was missing
        companyId,
        isOnboarded: true,
      },
    })

    res.json(recruiter)
  } catch (err) {
    console.error("Update recruiter profile error:", err)
    res.status(500).json({ error: "Failed to update profile" })
  }
}

export async function getRecruitersByCompany(req, res) {
  try {
    const { companyId } = req.query

    if (!companyId) {
      return res.status(400).json({ error: "CompanyId required" })
    }

    const recruiters = await prisma.user.findMany({
      where: {
        role: "recruiter",
        companyId: Number(companyId),
      },
      select: {
        id: true,
        email: true,
        username: true,
        companyId: true,
      },
    })

    res.json(recruiters)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch recruiters" })
  }
}


export async function getAllRecruiters(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin only" })
    }

    const recruiters = await prisma.user.findMany({
      where: {
        role: "recruiter",
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.json(recruiters)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch recruiters" })
  }
}
