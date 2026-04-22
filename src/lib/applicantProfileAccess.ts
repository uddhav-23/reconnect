import { getConnectionStatus } from '../services/firebaseFirestore';
import type { Alumni, User } from '../types';

/**
 * Whether the viewer may see email/phone/socials for an applicant (same rules as public alumni profile).
 */
export async function canViewerSeeApplicantPrivateContact(
  viewerId: string,
  applicantId: string,
  applicant: Pick<User, 'profileVisibility'> & { connections?: string[] }
): Promise<boolean> {
  if (viewerId === applicantId) return true;
  if (applicant.profileVisibility !== 'private') return true;
  const conn = await getConnectionStatus(viewerId, applicantId);
  const acceptedViaConnection = conn?.status === 'accepted';
  const inLegacyConnections = applicant.connections?.includes(viewerId) ?? false;
  return acceptedViaConnection || inLegacyConnections;
}

/** Sync version when connection status is already loaded. */
export function canSeeContactFromState(
  viewerId: string,
  applicant: Pick<User, 'id' | 'profileVisibility'> & { connections?: string[] },
  connectionAccepted: boolean
): boolean {
  if (viewerId === applicant.id) return true;
  if (applicant.profileVisibility !== 'private') return true;
  return connectionAccepted || (applicant.connections?.includes(viewerId) ?? false);
}

export function alumniPublicSummary(alumni: Alumni): string {
  const parts = [alumni.currentPosition, alumni.currentCompany].filter(Boolean);
  return parts.join(' · ') || alumni.degree || '';
}
