import { prisma } from "../lib/prisma.js";

/**
 * Candidate applies for job
 */
export async function applyJob(req, res) {
  try {
    const application = await prisma.jobApplication.create({
      data: {
        jobId: req.body.jobId,
        userId: req.user.userId,
        resumeUrl: req.body.resumeUrl,
        coverNote: req.body.coverNote,
      },
    });

    res.json(application);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Already applied for this job" });
    }
    console.error(err);
    res.status(500).json({ error: "Job application failed" });
  }
}

/**
 * Candidate: view own applications
 */
export async function getMyApplications(req, res) {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { userId: req.user.userId },
      include: {
        job: {
          include: { company: true },
        },
      },
    });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
}
