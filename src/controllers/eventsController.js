import { PrismaClient } from "@prisma/client"
import slugify from "slugify"

const prisma = new PrismaClient()

/**
 * ✅ ADMIN: Create Event
 */
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      logoUrl,
      bannerUrl,
      startDate,
      endDate,
      description,
      websiteUrl,
      registerUrl,
      location,
      calendarUrl,
      status
    } = req.body

    const userId = req.user.id // from auth middleware

    const event = await prisma.event.create({
      data: {
        title,
        slug: slugify(title, { lower: true }),
        logoUrl,
        bannerUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        websiteUrl,
        registerUrl,
        location,
        calendarUrl,
        status: status || "DRAFT",
        createdById: userId
      }
    })

    res.status(201).json({ success: true, event })
  } catch (error) {
    console.error("Create Event Error:", error)
    res.status(500).json({ success: false, message: "Failed to create event" })
  }
}

/**
 * ✅ ADMIN: Publish Event
 */
export const publishEvent = async (req, res) => {
  try {
    const { id } = req.params
    const adminId = req.user.id

    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        status: "PUBLISHED",
        approvedById: adminId,
        publishedAt: new Date()
      }
    })

    res.json({ success: true, event })
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to publish event" })
  }
}

/**
 * 🌍 PUBLIC: Get Upcoming Events (Search by title)
 * ✅ MySQL / MariaDB compatible
 */
export const getUpcomingEvents = async (req, res) => {
  try {
    const { q } = req.query

    const events = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        startDate: {
          gte: new Date(),
        },
        ...(q && {
          title: {
            contains: q, // ✅ works in MySQL
          },
        }),
      },
      orderBy: {
        startDate: "asc",
      },
    })

    res.json(events)
  } catch (error) {
    console.error("Get Upcoming Events Error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    })
  }
}



/**
 * 🌍 PUBLIC: Get Event By Slug
 */
export const getEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const event = await prisma.event.findUnique({
      where: { slug }
    })

    if (!event || event.status !== "PUBLISHED") {
      return res.status(404).json({ message: "Event not found" })
    }

    res.json(event)
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch event" })
  }
}

/**
 * ✅ ADMIN: List All Events
 */
export const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })

    res.json(events)
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch events" })
  }
}

/**
 * ✅ ADMIN: Update Event
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params

    const {
      title,
      logoUrl,
      bannerUrl,
      startDate,
      endDate,
      description,
      websiteUrl,
      registerUrl,
      location,
      calendarUrl,
    } = req.body

    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        title,
        logoUrl,
        bannerUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        websiteUrl,
        registerUrl,
        location,
        calendarUrl,
      },
    })

    res.json({ success: true, event })
  } catch (error) {
    console.error("Update Event Error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update event",
    })
  }
}

