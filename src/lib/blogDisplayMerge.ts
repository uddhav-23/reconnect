import { mockBlogs } from '../data/mockData';
import { getLocalBlogs } from './localBlogsStorage';
import type { Blog } from '../types';

/** In-memory featured posts shipped with the app (shown alongside Firestore). */
export function getPublishedMockBlogs(): Blog[] {
  return mockBlogs.map((b) => ({ ...b, status: 'published' as const }));
}

export function findMockBlogById(id: string): Blog | null {
  const b = mockBlogs.find((m) => m.id === id);
  return b ? ({ ...b, status: 'published' as const } as Blog) : null;
}

function byDateDesc(a: Blog, b: Blog): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

/** Merge Firestore results with mock + browser-local posts; optional author filter. */
export function mergeDisplayBlogs(fromFirestore: Blog[], authorId?: string): Blog[] {
  const mock = getPublishedMockBlogs();
  const local = getLocalBlogs();
  const fireIds = new Set(fromFirestore.map((x) => x.id));

  let extraMock = mock.filter((m) => !fireIds.has(m.id));
  let extraLocal = local.filter((l) => !fireIds.has(l.id));

  if (authorId) {
    extraMock = extraMock.filter((m) => m.authorId === authorId);
    extraLocal = extraLocal.filter((l) => l.authorId === authorId);
  }

  return [...fromFirestore, ...extraMock, ...extraLocal].sort(byDateDesc);
}
