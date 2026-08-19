import type { Role } from '@/lib/data/types';
import { getSession, type SessionPayload } from './session';

export { DEMO_ACCOUNTS } from './demoAccounts';

// Roles allowed to reach the command centre at all.
const COMMAND_CENTRE_ROLES: Role[] = [
  'SUPER_ADMIN',
  'COMMAND_CENTER',
  'POLICE',
  'MEDICAL',
  'FIRE',
  'SANITATION',
  'VOLUNTEER',
  'VIEW_ONLY'
];

// Roles allowed to perform write actions (dispatch, status changes, scenario
// triggers). VIEW_ONLY and VOLUNTEER can see the command centre but not
// mutate incident/dispatch state.
const WRITE_ROLES: Role[] = ['SUPER_ADMIN', 'COMMAND_CENTER', 'POLICE', 'MEDICAL', 'FIRE', 'SANITATION'];

export class AuthorizationError extends Error {
  status: 401 | 403;
  constructor(status: 401 | 403, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Every protected API route calls this directly — it re-reads and
 * re-verifies the session cookie server-side rather than trusting anything
 * the client claims. This is the independent check the spec requires in
 * addition to (not instead of) the coarse middleware redirect.
 */
export function requireSession(): SessionPayload {
  const session = getSession();
  if (!session) throw new AuthorizationError(401, 'Sign in to the command centre to continue.');
  if (!COMMAND_CENTRE_ROLES.includes(session.role)) {
    throw new AuthorizationError(403, 'Your account does not have command centre access.');
  }
  return session;
}

export function requireWriteAccess(): SessionPayload {
  const session = requireSession();
  if (!WRITE_ROLES.includes(session.role)) {
    throw new AuthorizationError(403, 'Your role has view-only access.');
  }
  return session;
}
