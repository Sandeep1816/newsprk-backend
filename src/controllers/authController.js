// // src/controllers/authController.js
// import prisma from "../prismaClient.js"
// import bcrypt from "bcrypt"
// import jwt from "jsonwebtoken"

// const JWT_SECRET = process.env.JWT_SECRET || "changeme"
// const SALT_ROUNDS = 10

// // ================= REGISTER =================
// export const register = async (req, res) => {
//   try {
//     const { email, password, role } = req.body

//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password required" })
//     }

//     // 🔒 prevent admin signup
//     const safeRole = role === "recruiter" ? "recruiter" : "candidate"

//     const existing = await prisma.user.findUnique({ where: { email } })
//     if (existing) {
//       return res.status(409).json({ error: "User already exists" })
//     }

//     const hashed = await bcrypt.hash(password, SALT_ROUNDS)

//     // ✅ auto username
//     const base = email.split("@")[0]
//     const username = `${base}_${Date.now().toString().slice(-5)}`

//     const user = await prisma.user.create({
//       data: {
//         email,
//         password: hashed,
//         role: safeRole,
//         username,
//       },
//     })

//     const token = jwt.sign(
//       { userId: user.id, role: user.role, email: user.email },
//       JWT_SECRET,
//       { expiresIn: "7d" }
//     )

//     res.status(201).json({
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         username: user.username,
//         isOnboarded: user.isOnboarded, // ✅ IMPORTANT
//         companyId: user.companyId ?? null,
//       },
//     })
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ error: "Internal server error" })
//   }
// }

// // ================= LOGIN =================
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body
//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password required" })
//     }

//     const user = await prisma.user.findUnique({
//       where: { email },
//       select: {
//         id: true,
//         email: true,
//         password: true,
//         role: true,
//         username: true,
//         isOnboarded: true, // 🔥 REQUIRED
//         companyId: true,   // 🔥 REQUIRED
//       },
//     })

//     if (!user) {
//       return res.status(401).json({ error: "Invalid credentials" })
//     }

//     const ok = await bcrypt.compare(password, user.password)
//     if (!ok) {
//       return res.status(401).json({ error: "Invalid credentials" })
//     }

//     const token = jwt.sign(
//       { userId: user.id, role: user.role, email: user.email },
//       JWT_SECRET,
//       { expiresIn: "7d" }
//     )

//     res.json({
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         username: user.username,
//         isOnboarded: user.isOnboarded, // ✅ FIX
//         companyId: user.companyId ?? null,
//       },
//     })
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ error: "Internal server error" })
//   }
// }


// src/controllers/authController.js
import prisma from "../prismaClient.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "changeme"
const SALT_ROUNDS = 10

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    const safeRole = role === "recruiter" ? "recruiter" : "candidate"

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: "User already exists" })
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS)

    const base = email.split("@")[0]
    const username = `${base}_${Date.now().toString().slice(-5)}`

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: safeRole,
        username,
      },
    })

    // 🔥 FIXED JWT PAYLOAD
    const token = jwt.sign(
      {
        id: user.id,                 // ✅ use `id`
        role: user.role,
        email: user.email,
        companyId: user.companyId,   // ✅ include companyId
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        isOnboarded: user.isOnboarded,
        companyId: user.companyId ?? null,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
}

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        username: true,
        isOnboarded: true,
        companyId: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // 🔥 FIXED JWT PAYLOAD
    const token = jwt.sign(
      {
        id: user.id,               // ✅ consistent key
        role: user.role,
        email: user.email,
        companyId: user.companyId, // ✅ REQUIRED
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        isOnboarded: user.isOnboarded,
        companyId: user.companyId ?? null,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
}
