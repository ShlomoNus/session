import { Router } from "express";
import { createOrReplaceCompanySession } from "../session/sessionStore";

export const companyRouter = Router();

/**
 * POST /select-company
 * Body: { userId, companyId }
 *
 * Creates/Replaces session ONLY here.
 * Stores session id in HttpOnly cookie.
 */
companyRouter.post("/select-company", (req, res) => {
  const { companyId, userId } = req.body as {
    userId?: string;
    companyId?: string;
  };

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  if (!companyId) {
    return res.status(400).json({ error: "companyId is required" });
  }

  // O(1): replaces previous session for that user (no loops)
  const session = createOrReplaceCompanySession({ userId, companyId });

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
