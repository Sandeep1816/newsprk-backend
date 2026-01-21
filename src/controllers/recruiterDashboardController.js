export async function getRecruiterDashboard(req, res) {
  try {
    const recruiterId = req.user.userId

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
    res.status(500).json({ error: "Failed to load dashboard" })
  }
}
