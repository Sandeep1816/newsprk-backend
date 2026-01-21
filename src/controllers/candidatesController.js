import { prisma } from "../lib/prisma.js"

export async function getCandidateProfile(req, res) {
  try {
    const { username } = req.params

    const candidate = await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        fullName: true,
        about: true,
        location: true,
        avatarUrl: true,
        role: true,
      },
    })

    if (!candidate || candidate.role !== "candidate") {
      return res.status(404).json({ error: "Candidate not found" })
    }

    res.json(candidate)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch candidate profile" })
  }
}
