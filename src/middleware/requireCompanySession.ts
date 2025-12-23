import { Request, Response, NextFunction } from "express";
import {
  getSessionById,
  isValidSession,
  touchSessionById,
} from "../session/sessionStore";

function readSessionId(req: Request): string | null {
  return (req.cookies?.sid as string | undefined) ?? null;
}



export function requireCompanySession({allowedRoles}: {allowedRoles: string[]}) {


  return function (req: Request, res: Response, next: NextFunction) {
    const sessionId = readSessionId(req);

    if (!sessionId) {
      return res.status(401).json({ error: "Missing session cookie" });
    }

    const session = getSessionById(sessionId);

    if (!session || !isValidSession(session)) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
      return res.status(403).json({ error: "Insufficient session role" });
    }

    res.locals.session = session;

    // sliding expiration
    touchSessionById(sessionId);

    next();
  }
}
