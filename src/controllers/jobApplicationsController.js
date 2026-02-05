import { prisma } from "../lib/prisma.js"

/**
 * Candidate applies for job
 */
export async function applyJob(req, res) {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({ error: "Only candidates can apply" })
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: req.body.jobId,
        userId: req.user.id,          // ✅ FIX
        resumeUrl: req.body.resumeUrl,
        coverNote: req.body.coverNote,
      },
    })

    res.json(application)
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Already applied for this job" })
    }
    console.error(err)
    res.status(500).json({ error: "Job application failed" })
  }
}

/**
 * Candidate: view own applications
 */
export async function getMyApplications(req, res) {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({ error: "Not allowed" })
    }

    const applications = await prisma.jobApplication.findMany({
      where: {
        userId: req.user.id,          // ✅ FIX (MOST IMPORTANT)
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        job: {
          include: { company: true },
        },
      },
    })

    res.json(applications)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch applications" })
  }
}

/**
 * Recruiter: view applicants for a job
 */
export async function getApplicantsByJob(req, res) {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Not allowed" })
    }

    const jobId = Number(req.params.jobId)

    // 🔒 Recruiter can see ONLY their jobs
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        postedById: req.user.id,      // ✅ FIX
      },
    })

    if (!job) {
      return res.status(404).json({ error: "Job not found" })
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            headline: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.json(applications)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch applicants" })
  }
}

/**
 * Recruiter: update application status
 */
export async function updateApplicationStatus(req, res) {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Not allowed" })
    }

    const { applicationId } = req.params
    const { status } = req.body

    if (!["shortlisted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    const application = await prisma.jobApplication.update({
      where: { id: Number(applicationId) },
      data: { status },
    })

    res.json(application)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to update status" })
  }
}
