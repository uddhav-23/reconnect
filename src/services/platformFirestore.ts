import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  Unsubscribe,
  limit,
  writeBatch,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  PlatformEvent,
  JobPosting,
  JobApplication,
  JobApplicationStatus,
  Mentorship,
  MentorshipMessage,
  Group,
  GroupMessage,
  AppNotification,
  ContentReport,
  Alumni,
  Blog,
} from '../types';
import { getAlumni, getBlogs, getUserById } from './firebaseFirestore';

const convertTs = (t: unknown): string => {
  if (
    t !== null &&
    typeof t === 'object' &&
    'toDate' in t &&
    typeof (t as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (t as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof t === 'string') return t;
  return new Date().toISOString();
};

function normalizeJobApplications(raw: unknown): JobApplication[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((a) => {
    const x = a as JobApplication;
    return {
      ...x,
      status: (x.status ?? 'pending') as JobApplicationStatus,
    };
  });
}

const prep = (data: Record<string, unknown>) => {
  const o: Record<string, unknown> = {};
  Object.keys(data).forEach((k) => {
    if (data[k] !== undefined) o[k] = data[k];
  });
  return o;
};

// --- Home stats ---
export interface HomePageData {
  alumniCount: number;
  blogCount: number;
  activeUserCount: number;
  collegeCount: number;
  featuredAlumni: Alumni[];
  recentBlogs: Blog[];
}

export async function getHomePageData(): Promise<HomePageData> {
  const usersSnap = await getDocs(collection(db, 'users'));
  let alumniCount = 0;
  let activeUserCount = 0;
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  usersSnap.forEach((d) => {
    const data = d.data();
    if (data.role === 'alumni') alumniCount += 1;
    const la = data.lastActiveAt;
    const t = la?.toDate ? la.toDate().getTime() : la ? new Date(la).getTime() : 0;
    if (t && t >= monthAgo) activeUserCount += 1;
  });
  if (activeUserCount === 0) activeUserCount = usersSnap.size;

  const blogs = await getBlogs();
  const published = blogs.filter((b) => !b.status || b.status === 'published');
  const alumniList = await getAlumni();
  const shuffled = [...alumniList].sort(() => Math.random() - 0.5).slice(0, 12);

  let collegeCount = 0;
  try {
    const collegesSnap = await getDocs(collection(db, 'colleges'));
    collegeCount = collegesSnap.size;
  } catch {
    collegeCount = 0;
  }

  return {
    alumniCount,
    blogCount: published.length,
    activeUserCount,
    collegeCount,
    featuredAlumni: shuffled,
    recentBlogs: published.slice(0, 9),
  };
}

// --- Events ---
export async function getUpcomingEvents(max = 50): Promise<PlatformEvent[]> {
  const q = query(collection(db, 'events'), orderBy('startAt', 'asc'));
  const snap = await getDocs(q).catch(async () => {
    const s = await getDocs(collection(db, 'events'));
    return s;
  });
  const now = Date.now();
  const items = snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        startAt: convertTs(data.startAt),
        endAt: data.endAt ? convertTs(data.endAt) : undefined,
        createdAt: convertTs(data.createdAt),
        attendeeIds: data.attendeeIds || [],
      } as PlatformEvent;
    })
    .filter((e) => new Date(e.startAt).getTime() >= now - 86400000);
  return items.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()).slice(0, max);
}

export async function getEventById(id: string): Promise<PlatformEvent | null> {
  const ref = doc(db, 'events', id);
  const s = await getDoc(ref);
  if (!s.exists()) return null;
  const data = s.data();
  return {
    id: s.id,
    ...data,
    startAt: convertTs(data.startAt),
    endAt: data.endAt ? convertTs(data.endAt) : undefined,
    createdAt: convertTs(data.createdAt),
    attendeeIds: data.attendeeIds || [],
  } as PlatformEvent;
}

export async function createEvent(
  data: Omit<PlatformEvent, 'id' | 'createdAt' | 'attendeeIds'> & { attendeeIds?: string[] }
): Promise<string> {
  const { startAt, endAt, ...rest } = data;
  const payload = {
    ...prep(rest as unknown as Record<string, unknown>),
    attendeeIds: data.attendeeIds || [],
    createdAt: Timestamp.now(),
    startAt: Timestamp.fromDate(new Date(startAt)),
    endAt: endAt ? Timestamp.fromDate(new Date(endAt)) : undefined,
  };
  const ref = await addDoc(collection(db, 'events'), payload);
  return ref.id;
}

export async function rsvpEvent(eventId: string, userId: string): Promise<void> {
  const ref = doc(db, 'events', eventId);
  await updateDoc(ref, { attendeeIds: arrayUnion(userId) });
}

// --- Jobs ---
export async function getJobs(): Promise<JobPosting[]> {
  const snap = await getDocs(query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))).catch(async () =>
    getDocs(collection(db, 'jobs'))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      applications: normalizeJobApplications(data.applications),
      createdAt: convertTs(data.createdAt),
      remote: !!data.remote,
    } as JobPosting;
  });
}

export async function getJobById(id: string): Promise<JobPosting | null> {
  const s = await getDoc(doc(db, 'jobs', id));
  if (!s.exists()) return null;
  const data = s.data();
  return {
    id: s.id,
    ...data,
    applications: normalizeJobApplications(data.applications),
    createdAt: convertTs(data.createdAt),
    remote: !!data.remote,
  } as JobPosting;
}

export async function createJob(
  data: Omit<JobPosting, 'id' | 'createdAt' | 'applications'>
): Promise<string> {
  const ref = await addDoc(
    collection(db, 'jobs'),
    prep({
      ...data,
      applications: [],
      createdAt: Timestamp.now(),
    } as unknown as Record<string, unknown>)
  );
  return ref.id;
}

export async function applyToJob(jobId: string, userId: string, note?: string): Promise<void> {
  const ref = doc(db, 'jobs', jobId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Job not found');
  const apps = normalizeJobApplications(snap.data().applications);
  if (apps.some((a) => a.userId === userId)) return;
  await updateDoc(ref, {
    applications: arrayUnion({
      userId,
      appliedAt: new Date().toISOString(),
      note,
      status: 'pending' as const,
    }),
  });
}

export async function updateJobApplicationStatus(
  jobId: string,
  viewerId: string,
  applicantUserId: string,
  status: 'accepted' | 'rejected'
): Promise<void> {
  const job = await getJobById(jobId);
  if (!job) throw new Error('Job not found');
  if (job.postedBy !== viewerId) throw new Error('Only the job poster can update applications');

  const apps = normalizeJobApplications(job.applications);
  const idx = apps.findIndex((a) => a.userId === applicantUserId);
  if (idx === -1) throw new Error('Applicant not found on this job');

  const next = apps.map((a, i) =>
    i === idx ? { ...a, status } : a
  );

  await updateDoc(doc(db, 'jobs', jobId), {
    applications: next,
  });

  try {
    await addDoc(collection(db, 'notifications'), {
      userId: applicantUserId,
      type: 'job_application',
      title: status === 'accepted' ? 'Application accepted' : 'Application update',
      body:
        status === 'accepted'
          ? `Your application for "${job.title}" was accepted.`
          : `Your application for "${job.title}" was not selected.`,
      actorId: viewerId,
      jobId,
      read: false,
      createdAt: Timestamp.now(),
      link: `/jobs/my-applications`,
    });
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('Job application notification failed:', e);
    }
  }
}

/** Jobs the user has applied to (may be expensive at scale — replace with indexed query later). */
export async function listJobsAppliedByUser(userId: string): Promise<{ job: JobPosting; application: JobApplication }[]> {
  const jobs = await getJobs();
  const rows: { job: JobPosting; application: JobApplication }[] = [];
  for (const job of jobs) {
    const app = job.applications?.find((a) => a.userId === userId);
    if (app) {
      rows.push({
        job,
        application: { ...app, status: app.status ?? 'pending' },
      });
    }
  }
  rows.sort(
    (a, b) =>
      new Date(b.application.appliedAt).getTime() - new Date(a.application.appliedAt).getTime()
  );
  return rows;
}

// --- Mentorship ---
export async function createMentorshipRequest(data: {
  mentorId: string;
  menteeId: string;
  topic: string;
}): Promise<string> {
  const mentor = await getUserById(data.mentorId);
  if (!mentor) {
    throw new Error('Mentor not found');
  }
  if (mentor.role === 'alumni' && mentor.openToMentoring === false) {
    throw new Error('This alum is not accepting mentorship requests right now.');
  }

  const ref = await addDoc(
    collection(db, 'mentorships'),
    prep({
      ...data,
      status: 'pending',
      createdAt: Timestamp.now(),
    } as unknown as Record<string, unknown>)
  );

  try {
    await addDoc(collection(db, 'notifications'), {
      userId: data.mentorId,
      type: 'mentorship',
      title: 'New mentorship request',
      body: `Someone requested mentorship: ${data.topic}`,
      actorId: data.menteeId,
      mentorshipId: ref.id,
      read: false,
      createdAt: Timestamp.now(),
      link: '/mentorship/hub',
    });
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('Mentorship notification failed:', e);
    }
  }

  return ref.id;
}

export async function updateMentorshipStatus(
  id: string,
  status: Mentorship['status'],
  sessionDate?: string
): Promise<void> {
  const mref = doc(db, 'mentorships', id);
  const snap = await getDoc(mref);
  if (!snap.exists()) throw new Error('Mentorship not found');

  const prev = snap.data() as { mentorId: string; menteeId: string; topic?: string };
  const updates: Record<string, unknown> = { status };
  if (sessionDate) updates.sessionDate = sessionDate;
  await updateDoc(mref, prep(updates));

  try {
    const recipientId = status === 'accepted' || status === 'declined' ? prev.menteeId : null;
    const actorId = prev.mentorId;
    if (recipientId && (status === 'accepted' || status === 'declined')) {
      await addDoc(collection(db, 'notifications'), {
        userId: recipientId,
        type: 'mentorship',
        title: status === 'accepted' ? 'Mentorship accepted' : 'Mentorship declined',
        body:
          status === 'accepted'
            ? 'Your mentor accepted your request. Open the thread to continue.'
            : 'Your mentorship request was declined.',
        actorId,
        mentorshipId: id,
        read: false,
        createdAt: Timestamp.now(),
        link: status === 'accepted' ? `/mentorship/${id}` : '/mentorship/hub',
      });
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('Mentorship response notification failed:', e);
    }
  }
}

export async function getMentorshipById(id: string): Promise<Mentorship | null> {
  const s = await getDoc(doc(db, 'mentorships', id));
  if (!s.exists()) return null;
  const data = s.data();
  return {
    id: s.id,
    ...data,
    createdAt: convertTs(data.createdAt),
    sessionDate: data.sessionDate ? convertTs(data.sessionDate) : undefined,
  } as Mentorship;
}

export async function listMentorshipsForUser(userId: string): Promise<Mentorship[]> {
  const q1 = query(collection(db, 'mentorships'), where('mentorId', '==', userId));
  const q2 = query(collection(db, 'mentorships'), where('menteeId', '==', userId));
  const [a, b] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const map = new Map<string, Mentorship>();
  [...a.docs, ...b.docs].forEach((d) => {
    const data = d.data();
    map.set(d.id, {
      id: d.id,
      ...data,
      createdAt: convertTs(data.createdAt),
      sessionDate: data.sessionDate ? convertTs(data.sessionDate) : undefined,
    } as Mentorship);
  });
  return Array.from(map.values()).sort(
    (x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()
  );
}

export async function addMentorshipMessage(
  mentorshipId: string,
  senderId: string,
  content: string
): Promise<string> {
  const m = await getDoc(doc(db, 'mentorships', mentorshipId));
  if (!m.exists()) throw new Error('Mentorship not found');
  const st = (m.data() as { status?: string }).status;
  if (st !== 'accepted' && st !== 'completed') {
    throw new Error('Messaging is available only after the mentorship request is accepted.');
  }
  const mentorId = (m.data() as { mentorId: string }).mentorId;
  const menteeId = (m.data() as { menteeId: string }).menteeId;
  if (senderId !== mentorId && senderId !== menteeId) {
    throw new Error('Not authorized');
  }

  const ref = await addDoc(collection(doc(db, 'mentorships', mentorshipId), 'messages'), {
    mentorshipId,
    senderId,
    content,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export function subscribeMentorshipMessages(
  mentorshipId: string,
  cb: (messages: MentorshipMessage[]) => void
): Unsubscribe {
  const q = query(
    collection(doc(db, 'mentorships', mentorshipId), 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: convertTs(d.data().createdAt),
      })) as MentorshipMessage[];
      cb(list);
    },
    () => cb([])
  );
}

// --- Groups ---
export async function getGroups(): Promise<Group[]> {
  const snap = await getDocs(collection(db, 'groups'));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      members: data.members || [],
      adminIds: data.adminIds || [],
      createdAt: convertTs(data.createdAt),
    } as Group;
  });
}

export async function getGroupById(id: string): Promise<Group | null> {
  const s = await getDoc(doc(db, 'groups', id));
  if (!s.exists()) return null;
  const data = s.data();
  return {
    id: s.id,
    ...data,
    members: data.members || [],
    adminIds: data.adminIds || [],
    createdAt: convertTs(data.createdAt),
  } as Group;
}

export async function createGroup(data: Omit<Group, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(
    collection(db, 'groups'),
    prep({
      ...data,
      members: data.members || [],
      adminIds: data.adminIds || [],
      createdAt: Timestamp.now(),
    } as unknown as Record<string, unknown>)
  );
  return ref.id;
}

export async function joinGroup(groupId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'groups', groupId), { members: arrayUnion(userId) });
}

export async function sendGroupMessage(groupId: string, senderId: string, content: string): Promise<void> {
  await addDoc(collection(doc(db, 'groups', groupId), 'messages'), {
    groupId,
    senderId,
    content,
    createdAt: Timestamp.now(),
  });
}

export function subscribeGroupMessages(
  groupId: string,
  cb: (messages: GroupMessage[]) => void
): Unsubscribe {
  const q = query(
    collection(doc(db, 'groups', groupId), 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: convertTs(d.data().createdAt),
    })) as GroupMessage[];
    cb(list);
  });
}

// --- Notifications ---
export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  const snap = await getDocs(q).catch(async () => {
    const q2 = query(collection(db, 'notifications'), where('userId', '==', userId));
    return getDocs(q2);
  });
  const items = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: convertTs(data.createdAt),
    } as AppNotification;
  });
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function subscribeNotifications(
  userId: string,
  cb: (items: AppNotification[]) => void
): Unsubscribe {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId), limit(100));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: convertTs(d.data().createdAt),
    })) as AppNotification[];
    cb(items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const items = await getNotifications(userId);
  const unread = items.filter((n) => !n.read);
  if (unread.length === 0) return;
  const batch = writeBatch(db);
  unread.forEach((n) => {
    batch.update(doc(db, 'notifications', n.id), { read: true });
  });
  await batch.commit();
}

/** Admin or system use — creates notification for a user */
export async function createAppNotification(n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<string> {
  const ref = await addDoc(
    collection(db, 'notifications'),
    prep({
      ...n,
      read: false,
      createdAt: Timestamp.now(),
    } as unknown as Record<string, unknown>)
  );
  return ref.id;
}

// --- Reports ---
export async function createContentReport(
  report: Omit<ContentReport, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const ref = await addDoc(
    collection(db, 'reports'),
    prep({
      ...report,
      status: 'open',
      createdAt: Timestamp.now(),
    } as unknown as Record<string, unknown>)
  );
  return ref.id;
}

export async function listOpenReports(): Promise<ContentReport[]> {
  const snap = await getDocs(query(collection(db, 'reports'), where('status', '==', 'open')));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: convertTs(d.data().createdAt),
  })) as ContentReport[];
}
