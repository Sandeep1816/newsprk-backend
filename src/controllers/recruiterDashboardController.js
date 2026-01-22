export async function getRecruiterDashboard(req, res) {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Not allowed" })
    }

    const recruiterId = req.user.userId ?? req.user.id

    const jobs = await prisma.job.findMany({
      where: {
        postedById: recruiterId,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const applicationsCount = await prisma.jobApplication.count({
      where: {
        job: {
          postedById: recruiterId,
        },
      },
    })

    res.json({
      jobsCount: jobs.length,
      applicationsCount,
      recentJobs: jobs.slice(0, 5),
    })
  } catch (err) {
    console.error("Recruiter dashboard error:", err)
    res.status(500).json({ error: "Failed to load dashboard" })
  }
}
