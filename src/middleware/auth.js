// import jwt from "jsonwebtoken";
// const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// export function requireAuth(req, res, next) {
//   try {
//     const header = req.headers.authorization;
//     if (!header) return res.status(401).json({ error: "Authorization header required" });

//     const parts = header.split(" ");
//     if (parts.length !== 2 || parts[0] !== "Bearer")
//       return res.status(401).json({ error: "Invalid auth format" });

//     const token = parts[1];
//     const payload = jwt.verify(token, JWT_SECRET);
//     req.user = payload; // { userId, role, email, iat, exp }
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: "Invalid or expired token" });
//   }
// }

// export function requireAdmin(req, res, next) {
//   if (!req.user) return res.status(401).json({ error: "Not authenticated" });
//   if (req.user.role !== "admin")
//     return res.status(403).json({ error: "Admin role required" });
//   next();
// }

import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "changeme"

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header) {
      return res.status(401).json({ error: "Authorization header required" })
    }

    const [type, token] = header.split(" ")
    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Invalid auth format" })
    }

    const payload = jwt.verify(token, JWT_SECRET)

    // ✅ normalize role
    req.user = {
      ...payload,
      role: payload.role?.toLowerCase(),
    }

    next()
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" })
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin role required" })
  }

  next()
}
