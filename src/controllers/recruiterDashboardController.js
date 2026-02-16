import { prisma } from "../lib/prisma.js"


export async function getRecruiterDashboard(req, res) {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Not allowed" })
    }

    // const recruiterId = req.user.userId
    const recruiterId = req.user.id


    // Jobs
    const jobs = await prisma.job.findMany({
      where: {
        postedById: recruiterId,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Applications count ✅ CORRECT MODEL
    const applicationsCount = await prisma.jobApplication.count({
      where: {
        job: {
          postedById: recruiterId,
        },
      },
    })

    // Directories
    const directories = await prisma.supplierDirectory.findMany({
      where: {
        submittedById: recruiterId,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        isLiveEditable: true,
        createdAt: true,
        approvedAt: true,
      },
    })

    res.json({
      jobsCount: jobs.length,
      applicationsCount,
      directoriesCount: directories.length,
      recentJobs: jobs.slice(0, 5),
      directories,
    })
  } catch (err) {
    console.error("Recruiter dashboard error:", err)
    res.status(500).json({ error: "Failed to load dashboard" })
  }
}
