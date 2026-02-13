import { prisma } from "../lib/prisma.js";
import slugify from "slugify";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const MAIL_FROM = process.env.MAIL_FROM

/* ======================================================
   CREATE MAGAZINE (ADMIN ONLY)
====================================================== */
export const createMagazine = async (req, res) => {
  try {
    const { title, description, coverImageUrl, pdfUrl,flipbookPages, status } = req.body;

    if (!title || !pdfUrl) {
      return res.status(400).json({ error: "Title and PDF are required" });
    }

    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;

    // 🔒 Prevent duplicate slug
    const existing = await prisma.magazine.findUnique({
      where: { slug },
    });

    if (existing) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    const magazine = await prisma.magazine.create({
      data: {
        title,
        slug,
        description,
        coverImageUrl,
        pdfUrl,
        flipbookPages,
        status: status || "DRAFT",
        createdById: req.user.id,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });

    res.json(magazine);

  } catch (error) {
    console.error("CREATE MAGAZINE ERROR:", error);
    res.status(500).json({ error: "Failed to create magazine" });
  }
};

/* ======================================================
   REGISTER FOR MAGAZINE + SEND EMAIL (RESEND)
====================================================== */
export const registerMagazine = async (req, res) => {
  try {
    const { magazineId } = req.params;
    const { firstName, lastName, email, companyName, jobTitle, country } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: "First name, last name and email are required" });
    }

    const magazine = await prisma.magazine.findUnique({
      where: { id: Number(magazineId) },
    });

    if (!magazine) {
      return res.status(404).json({ error: "Magazine not found" });
    }

    if (magazine.status !== "PUBLISHED") {
      return res.status(400).json({ error: "Magazine not available" });
    }

    // 🔒 Prevent duplicate registration
    const existing = await prisma.magazineRegistration.findFirst({
      where: {
        magazineId: Number(magazineId),
        email,
      },
    });

    if (existing) {
      return res.status(400).json({ error: "You already registered for this magazine" });
    }

    // ✅ Save registration
    await prisma.magazineRegistration.create({
      data: {
        magazineId: magazine.id,
        firstName,
        lastName,
        email,
        companyName,
        jobTitle,
        country,
      },
    });

    /* ======================================================
       SEND EMAIL USING RESEND
    ====================================================== */

  await resend.emails.send({
  from: `MoldMaking Technology <${MAIL_FROM}>`,
  to: email,
  subject: `Your Digital Magazine - ${magazine.title}`,
  html: `
    <h2>Hello ${firstName},</h2>
    <p>Attached is your digital magazine.</p>
    <p>Thank you for registering.</p>
  `,
  attachments: [
    {
      filename: `${magazine.title}.pdf`,
      path: magazine.pdfUrl, // Cloudinary public URL
    },
  ],
});


    res.json({ success: true });

  } catch (error) {
    console.error("MAGAZINE REGISTRATION ERROR:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};


/* ======================================================
   GET ALL PUBLISHED MAGAZINES (PUBLIC)
====================================================== */
export const getAllMagazines = async (req, res) => {
  try {
    const magazines = await prisma.magazine.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
    });

    res.json(magazines);
  } catch (error) {
    console.error("GET MAGAZINES ERROR:", error);
    res.status(500).json({ error: "Failed to fetch magazines" });
  }
};



export const getSingleMagazine = async (req, res) => {
  const { slug } = req.params;

  const magazine = await prisma.magazine.findUnique({
    where: { slug },
  });

  if (!magazine || magazine.status !== "PUBLISHED") {
    return res.status(404).json({ error: "Magazine not found" });
  }

  res.json(magazine);
};

export const updateMagazine = async (req, res) => {
  const { id } = req.params;

  const magazine = await prisma.magazine.update({
    where: { id: Number(id) },
    data: req.body,
  });

  res.json(magazine);
};

export const deleteMagazine = async (req, res) => {
  const { id } = req.params;

  await prisma.magazine.delete({
    where: { id: Number(id) },
  });

  res.json({ success: true });
};

export const getMagazineRegistrations = async (req, res) => {
  const { id } = req.params;

  const registrations = await prisma.magazineRegistration.findMany({
    where: { magazineId: Number(id) },
    orderBy: { createdAt: "desc" },
  });

  res.json(registrations);
};
