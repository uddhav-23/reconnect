/**
 * Centralized environment validation for Vite (import.meta.env).
 * Firebase keys fall back to compile-time defaults in firebase.ts when unset.
 */

const optional = (key: string): string | undefined => {
  const v = import.meta.env[key as keyof ImportMetaEnv];
  return typeof v === 'string' && v.length > 0 ? v : undefined;
};

export const env = {
  /**
   * Only this email may create or promote super-admins in the app UI; must match
   * `isPlatformOwner()` in firestore.rules (same default if env unset).
   */
  platformOwnerEmail: (): string =>
    (optional('VITE_PLATFORM_OWNER_EMAIL') || 'uddhavjoshi24@gmail.com').trim().toLowerCase(),

  /** Comma-separated email domains that auto-verify alumni (e.g. @college.edu) */
  institutionalEmailDomains: (): string[] => {
    const raw = optional('VITE_INSTITUTIONAL_EMAIL_DOMAINS') || '';
    return raw
      .split(',')
      .map((s) => s.trim().toLowerCase().replace(/^@/, ''))
      .filter(Boolean);
  },
  /** Optional Algolia — wire in src/services/searchOptional.ts when needed */
  algoliaAppId: () => optional('VITE_ALGOLIA_APP_ID'),
  algoliaSearchKey: () => optional('VITE_ALGOLIA_SEARCH_KEY'),
  isDev: () => import.meta.env.DEV,
};

export function emailMatchesInstitutionalDomain(email: string): boolean {
  const domains = env.institutionalEmailDomains();
  if (domains.length === 0) return false;
  const lower = email.trim().toLowerCase();
  const at = lower.lastIndexOf('@');
  if (at < 0) return false;
  const host = lower.slice(at + 1);
  return domains.some((d) => host === d || host.endsWith(`.${d}`));
}
