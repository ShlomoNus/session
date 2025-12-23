import crypto from 'crypto';

export type CompanySession = {
  id: string;
  userId: string;
  companyId: string;
  role: string;
  createdAt: number;
  lastSeenAt: number;
  expiresAt: number;
  revokedAt?: number;
};

export type Params = {
  userId: string;
  companyId: string;
  role: string;
};

const TTL_MS = 30 * 60 * 1000;

const sessionsById = new Map<string, CompanySession>();

export function createOrReplaceCompanySession({ userId, companyId, role }: Params): CompanySession {
  const now = Date.now();
  for (const session of sessionsById.values()) {
    if (session.userId === userId && !session.revokedAt) {
      session.revokedAt = now;
    }
  }
  const session: CompanySession = {
    id: crypto.randomBytes(24).toString('hex'),
    userId: userId,
    companyId: companyId,
    role,
    createdAt: now,
    lastSeenAt: now,
    expiresAt: now + TTL_MS,
  };
  sessionsById.set(session.id, session);
  return session;
}

export function getSessionByUserId(userId: string): CompanySession | undefined {
  for (const session of sessionsById.values()) {
    if (session.userId === userId) {
      return session;
    }
  }
  return undefined;
}

export function getSessionById(sessionId: string): CompanySession | undefined {
  return sessionsById.get(sessionId);
}

export function revokeSessionByUserId(userId: string): boolean {
  let revoked = false;
  const now = Date.now();
  for (const session of sessionsById.values()) {
    if (session.userId === userId && !session.revokedAt) {
      session.revokedAt = now;
      revoked = true;
    }
  }
  return revoked;
}

export function revokeSessionById(sessionId: string): boolean {
  const session = sessionsById.get(sessionId);
  if (!session) return false;
  if (!session.revokedAt) {
    session.revokedAt = Date.now();
  }
  return true;
}

export function touchSessionById(sessionId: string): CompanySession | null {
  const session = sessionsById.get(sessionId);
  if (!session) return null;
  const now = Date.now();
  session.lastSeenAt = now;
  session.expiresAt = now + TTL_MS;
  return session;
}

export function isValidSession(s: CompanySession): boolean {
  if (s.revokedAt) return false;
  return s.expiresAt > Date.now();
}
