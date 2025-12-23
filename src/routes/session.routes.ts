import { Router } from "express";
import { requireCompanySession } from "../middleware/requireCompanySession";
import { revokeSessionById } from "../session/sessionStore";

export const sessionRouter = Router();

sessionRouter.get("/me", requireCompanySession({allowedRoles: ["admin", "user"]}), (_req, res) => {
  const s = res.locals.session;

  res.json({
    companyId: s.companyId,
    expiresAt: s.expiresAt,
    role: s.role,
  });
});

sessionRouter.get("/adminOnly", requireCompanySession({allowedRoles: ["admin"]}), (_req, res) => {
  const s = res.locals.session;

  res.json({
    companyId: s.companyId,
    expiresAt: s.expiresAt,
    role: s.role,
  });
});


sessionRouter.delete("/logout", requireCompanySession({allowedRoles: ["admin", "user"]}), (req, res) => {
  const sid = (req.cookies?.sid as string | undefined) ?? null;
  if (sid) revokeSessionById(sid);

  res.clearCookie("sid", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(204).send();
});
