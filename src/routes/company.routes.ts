import { Router } from "express";
import { createOrReplaceCompanySession } from "../session/sessionStore";
import { users } from "../db";

export const companyRouter = Router();

/**
 * POST /select-company
 * Body: { userId, companyId }
 *
 * Creates/Replaces session ONLY here.
 * Stores session id in HttpOnly cookie.
 */
companyRouter.post("/select-company", (req, res) => {
  const { userId, companyId } = req.body as {
    userId?: string;
    companyId?: string;
  };

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  if (!companyId) {
    return res.status(400).json({ error: "companyId is required" });
  }

  const user = users.filter((u) => u.id === userId && u.companyId === companyId)[0]

  if (!user?.role) {
    return res.status(403).json({ error: "User does not belong to the specified company" });
  }
  const session = createOrReplaceCompanySession({ userId, companyId, role: user.role });

  res.cookie("sid", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 60 * 1000,
  });

  return res.status(201).json({
    companyId: session.companyId,
    expiresAt: session.expiresAt,
  });
});
