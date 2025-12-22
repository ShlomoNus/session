import crypto from "crypto";

export type CompanySession = {
  id: string; // sessionId (sid cookie)
  userId: string;
  companyId: string;
  createdAt: number;
  lastSeenAt: number;
  expiresAt: number;
  revokedAt?: number;
};

const TTL_MS = 30 * 60 * 1000; // 30 minutes

// Primary store: one session per user
const sessionsByUserId = new Map<string, CompanySession>();

// Secondary index: sid -> userId (for cookie lookup)
const userIdBySessionId = new Map<string, string>();

export function createOrReplaceCompanySession(params: { userId: string; companyId: string }) {
  const now = Date.now();

  // If user already has an active session, revoke it and remove old sid index
  const existing = sessionsByUserId.get(params.userId);
  if (existing) {
    existing.revokedAt = now;
    userIdBySessionId.delete(existing.id);
    // replace session object entirely below
  }

  const session: CompanySession = {
    id: crypto.randomBytes(24).toString("hex"),
    userId: params.userId,
    companyId: params.companyId,
    createdAt: now,
    lastSeenAt: now,
    expiresAt: now + TTL_MS,
  };

  sessionsByUserId.set(params.userId, session);
  userIdBySessionId.set(session.id, params.userId);

  return session;
}

export function getSessionByUserId(userId: string) {
  return sessionsByUserId.get(userId);
}

export function getSessionById(sessionId: string) {
  const userId = userIdBySessionId.get(sessionId);
  if (!userId) return undefined;
  return sessionsByUserId.get(userId);
}

export function revokeSessionByUserId(userId: string) {
  const s = sessionsByUserId.get(userId);
  if (!s) return false;

  s.revokedAt = Date.now();
  sessionsByUserId.set(userId, s);
  userIdBySessionId.delete(s.id);
  return true;
}

export function revokeSessionById(sessionId: string) {
  const userId = userIdBySessionId.get(sessionId);
  if (!userId) return false;
  return revokeSessionByUserId(userId);
}

export function touchSessionById(sessionId: string) {
  const s = getSessionById(sessionId);
  if (!s) return null;

  const now = Date.now();
  s.lastSeenAt = now;
  s.expiresAt = now + TTL_MS;

  sessionsByUserId.set(s.userId, s);
  // indexes stay valid
  return s;
}

export function isValidSession(s: CompanySession) {
  if (s.revokedAt) return false;
  if (s.expiresAt <= Date.now()) return false;
  return true;
}
