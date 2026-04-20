import type { Alumni, Blog, Comment, User } from '../types';

const STORAGE_KEY = 'reconnect-local-blogs-v1';

function buildAuthor(user: User): Alumni {
  const u = user as User & Partial<Alumni>;
  return {
    ...user,
    role: 'alumni',
    graduationYear: u.graduationYear ?? 2020,
    degree: u.degree ?? 'Alumni',
    department: u.department ?? '',
    currentCompany: u.currentCompany ?? '',
    currentPosition: u.currentPosition ?? 'Member',
    skills: u.skills ?? [],
    achievements: u.achievements ?? [],
    blogs: [],
    connections: u.connections ?? [],
    socialLinks: u.socialLinks ?? {},
    experience: u.experience ?? [],
    education: u.education ?? [],
    bio: u.bio,
    location: u.location,
    phone: u.phone,
    address: u.address,
  } as Alumni;
}

export function getLocalBlogs(): Blog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Blog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLocalBlogById(id: string): Blog | null {
  if (!id.startsWith('local-')) return null;
  return getLocalBlogs().find((b) => b.id === id) ?? null;
}

export function saveLocalBlog(
  post: { title: string; content: string; excerpt: string; tags: string[] },
  user: User
): Blog {
  const id = `local-${Date.now()}`;
  const now = new Date().toISOString();
  const blog: Blog = {
    id,
    title: post.title.trim(),
    content: post.content.trim(),
    excerpt:
      post.excerpt.trim() ||
      (post.content.length > 160 ? `${post.content.slice(0, 157)}...` : post.content),
    tags: post.tags,
    authorId: user.id,
    author: buildAuthor(user),
    publishedAt: now,
    likes: 0,
    likedBy: [],
    comments: [],
    shares: 0,
    status: 'published',
  };
  const list = [blog, ...getLocalBlogs()];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return blog;
}

export function updateLocalBlogLikes(blogId: string, userId: string): Blog | null {
  const list = getLocalBlogs();
  const idx = list.findIndex((b) => b.id === blogId);
  if (idx < 0) return null;
  const b = list[idx];
  const likedBy = b.likedBy || [];
  const isLiked = likedBy.includes(userId);
  const nextLiked = isLiked ? likedBy.filter((id) => id !== userId) : [...likedBy, userId];
  const nextLikes = Math.max(0, (b.likes || 0) + (isLiked ? -1 : 1));
  const updated = { ...b, likedBy: nextLiked, likes: nextLikes };
  list[idx] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return updated;
}

export function appendLocalBlogComment(blogId: string, comment: Comment): Blog | null {
  const list = getLocalBlogs();
  const idx = list.findIndex((b) => b.id === blogId);
  if (idx < 0) return null;
  const b = list[idx];
  const comments = [...(b.comments || []), comment];
  const updated = { ...b, comments };
  list[idx] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return updated;
}
