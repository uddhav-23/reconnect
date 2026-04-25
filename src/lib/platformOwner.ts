import { auth } from '../config/firebase';
import { env } from '../config/env';

/** Email of the platform owner who alone may create additional super-admins. */
export function getPlatformOwnerEmail(): string {
  return env.platformOwnerEmail();
}

export function isPlatformOwnerUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === getPlatformOwnerEmail();
}

/**
 * Prefer Firebase Auth email (who is actually signed in), then profile email.
 * Firestore `users` docs sometimes omit or mismatch `email`, which would disable owner-only UI incorrectly.
 */
export function isCurrentSessionPlatformOwner(user: { email?: string | null } | null | undefined): boolean {
  const authEmail = auth.currentUser?.email?.trim().toLowerCase() ?? '';
  const docEmail = typeof user?.email === 'string' ? user.email.trim().toLowerCase() : '';
  const effective = authEmail || docEmail;
  return !!effective && effective === getPlatformOwnerEmail();
}
