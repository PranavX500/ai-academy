import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function authMiddleware(req, res, next) {
  // Try to get token from cookies first
  const token = req.cookies?.token;

  // Optional fallback (if you still want header support)
  const authHeader = req.headers.authorization;

  let finalToken = token;

  if (!finalToken && authHeader && authHeader.startsWith("Bearer ")) {
    finalToken = authHeader.split(" ")[1];
  }

  if (!finalToken) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(finalToken, env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT Error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}