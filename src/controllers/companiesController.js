import { prisma } from "../lib/prisma.js";

/**
 * Recruiter creates company
 */
export async function createCompany(req, res) {
  try {
    const company = await prisma.company.create({
      data: {
        name: req.body.name,
        logoUrl: req.body.logoUrl,
        website: req.body.website,
        description: req.body.description,
        location: req.body.location,
      },
    });

    res.json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Company creation failed" });
  }
}

/**
 * Public: list companies
 */
export async function getAllCompanies(req, res) {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch companies" });
  }
}

/**
 * Admin: verify company
 */
export async function verifyCompany(req, res) {
  try {
    const company = await prisma.company.update({
      where: { id: Number(req.params.id) },
      data: { isVerified: true },
    });

    res.json(company);
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
}
