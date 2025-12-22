import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/requireJwtGlobal";

const PUBLIC_PATHS = new Set([
  "/login",
  "/health",
]);

export function requireJwtGlobal(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (PUBLIC_PATHS.has(req.path)) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Invalid Authorization format" });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
