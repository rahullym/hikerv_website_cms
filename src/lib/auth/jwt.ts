import jwt from 'jsonwebtoken';
import type { UserRole } from '../db/models/User';

function getSecret(): string {
  const secret = import.meta.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET is not set. Add it to your .env file (see .env.example).'
    );
  }
  return secret;
}

export const SESSION_COOKIE = 'hvcms_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  sub: string; // user _id
  email: string;
  role: UserRole;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: SESSION_TTL_SECONDS });
}

export function verifySession(token: string): SessionPayload | null {
  // If the env is unconfigured we treat the cookie as invalid rather than
  // crashing every request the middleware touches.
  if (!import.meta.env.JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, getSecret());
    if (typeof decoded === 'string') return null;
    return decoded as SessionPayload;
  } catch {
    return null;
  }
}

export function sessionCookieAttributes(): string {
  const secure = import.meta.env.PROD ? 'Secure; ' : '';
  return `Path=/; HttpOnly; SameSite=Lax; ${secure}Max-Age=${SESSION_TTL_SECONDS}`;
}
