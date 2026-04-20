import type { User } from '../types';

export function isAdmin(user: User | null): boolean {
  return user?.role === 'superadmin' || user?.role === 'subadmin';
}

export function isSuperAdmin(user: User | null): boolean {
  return user?.role === 'superadmin';
}
