import type { APIContext } from 'astro';
import { SESSION_COOKIE, verifySession, type SessionPayload } from './jwt';
import type { UserRole } from '../db/models/User';

export function readSession(context: APIContext | { cookies: APIContext['cookies'] }): SessionPayload | null {
  const cookie = context.cookies.get(SESSION_COOKIE);
  if (!cookie?.value) return null;
  return verifySession(cookie.value);
}

const ROLE_RANK: Record<UserRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
};

export function hasRole(session: SessionPayload | null, minimum: UserRole): boolean {
  if (!session) return false;
  return ROLE_RANK[session.role] >= ROLE_RANK[minimum];
}
