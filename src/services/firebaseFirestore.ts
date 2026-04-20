import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
  QueryDocumentSnapshot,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { mergeDisplayBlogs, findMockBlogById } from '../lib/blogDisplayMerge';
import { getLocalBlogById, updateLocalBlogLikes, appendLocalBlogComment } from '../lib/localBlogsStorage';
import { College, Alumni, Blog, Achievement, User, Connection, Message, Comment } from '../types';

// Helper to convert Firestore timestamps
const convertTimestamp = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp || new Date().toISOString();
};

// Helper to convert data for Firestore (remove undefined fields)
const prepareForFirestore = (data: any): any => {
  const cleaned: any = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      cleaned[key] = data[key];
    }
  });
  return cleaned;
};

// ==================== COLLEGES ====================

export const getColleges = async (universityId?: string): Promise<College[]> => {
  try {
    const constraints: QueryConstraint[] = [];
    if (universityId) {
      constraints.push(where('universityId', '==', universityId));
    }
    
    // Try with orderBy first, fallback to without if index is missing
    let q;
    try {
      constraints.push(orderBy('createdAt', 'desc'));
      q = query(collection(db, 'colleges'), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      })) as College[];
    } catch (orderByError: any) {
      // If orderBy fails (likely missing index), try without it
      if (orderByError.code === 'failed-precondition' || orderByError.message?.includes('index')) {
        console.warn('Index missing for orderBy, fetching without sorting:', orderByError.message);
        const constraintsWithoutOrder = universityId 
          ? [where('universityId', '==', universityId)]
          : [];
        q = query(collection(db, 'colleges'), ...constraintsWithoutOrder);
        const querySnapshot = await getDocs(q);
        const colleges = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: convertTimestamp(doc.data().createdAt),
        })) as College[];
        // Sort manually
        return colleges.sort((a, b) => {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return bDate - aDate;
        });
      }
      throw orderByError;
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch colleges');
  }
};

export const getCollege = async (collegeId: string): Promise<College | null> => {
  try {
    const docRef = doc(db, 'colleges', collegeId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: convertTimestamp(docSnap.data().createdAt),
    } as College;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch college');
  }
};

export const createCollege = async (collegeData: Omit<College, 'id'>): Promise<string> => {
  try {
    const data = {
      ...prepareForFirestore(collegeData),
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'colleges'), data);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create college');
  }
};

export const updateCollege = async (collegeId: string, updates: Partial<College>): Promise<void> => {
  try {
    const collegeRef = doc(db, 'colleges', collegeId);
    await updateDoc(collegeRef, prepareForFirestore(updates));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update college');
  }
};

export const deleteCollege = async (collegeId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'colleges', collegeId));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete college');
  }
};

// ==================== ALUMNI ====================

export const getAlumni = async (collegeId?: string, universityId?: string): Promise<Alumni[]> => {
  try {
    const constraints: QueryConstraint[] = [where('role', '==', 'alumni')];
    
    if (collegeId) {
      constraints.push(where('collegeId', '==', collegeId));
    } else if (universityId) {
      constraints.push(where('universityId', '==', universityId));
    }
    
    // Try with orderBy first, fallback to without if index is missing
    try {
      constraints.push(orderBy('createdAt', 'desc'));
      const q = query(collection(db, 'users'), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        achievements: doc.data().achievements || [],
        blogs: doc.data().blogs || [],
        connections: doc.data().connections || [],
        skills: doc.data().skills || [],
        experience: doc.data().experience || [],
        education: doc.data().education || [],
      })) as Alumni[];
    } catch (orderByError: any) {
      // If orderBy fails (likely missing index), try without it
      if (orderByError.code === 'failed-precondition' || orderByError.message?.includes('index')) {
        console.warn('Index missing for orderBy, fetching without sorting:', orderByError.message);
        const constraintsWithoutOrder: QueryConstraint[] = [where('role', '==', 'alumni')];
        if (collegeId) {
          constraintsWithoutOrder.push(where('collegeId', '==', collegeId));
        } else if (universityId) {
          constraintsWithoutOrder.push(where('universityId', '==', universityId));
        }
        const q = query(collection(db, 'users'), ...constraintsWithoutOrder);
        const querySnapshot = await getDocs(q);
        const alumni = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: convertTimestamp(doc.data().createdAt),
          achievements: doc.data().achievements || [],
          blogs: doc.data().blogs || [],
          connections: doc.data().connections || [],
          skills: doc.data().skills || [],
          experience: doc.data().experience || [],
          education: doc.data().education || [],
        })) as Alumni[];
        // Sort manually
        return alumni.sort((a, b) => {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return bDate - aDate;
        });
      }
      throw orderByError;
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch alumni');
  }
};

export const getAlumniById = async (alumniId: string): Promise<Alumni | null> => {
  try {
    const docRef = doc(db, 'users', alumniId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists() || docSnap.data().role !== 'alumni') {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      achievements: data.achievements || [],
      blogs: data.blogs || [],
      connections: data.connections || [],
      skills: data.skills || [],
      experience: data.experience || [],
      education: data.education || [],
      socialLinks: data.socialLinks || {},
    } as Alumni;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch alumni');
  }
};

export const createAlumni = async (alumniData: Omit<Alumni, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const data = {
      ...prepareForFirestore(alumniData),
      role: 'alumni',
      createdAt: Timestamp.now(),
      achievements: alumniData.achievements || [],
      blogs: alumniData.blogs || [],
      connections: alumniData.connections || [],
      skills: alumniData.skills || [],
      experience: alumniData.experience || [],
      education: alumniData.education || [],
    };
    
    const docRef = await addDoc(collection(db, 'users'), data);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create alumni');
  }
};

export const updateAlumni = async (alumniId: string, updates: Partial<Alumni>): Promise<void> => {
  try {
    const alumniRef = doc(db, 'users', alumniId);
    await updateDoc(alumniRef, prepareForFirestore(updates));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update alumni');
  }
};

export const deleteAlumni = async (alumniId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', alumniId));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete alumni');
  }
};

// ==================== BLOGS ====================

/** All blogs including drafts — use only in trusted admin UI */
export const getAllBlogsAdmin = async (): Promise<Blog[]> => {
  const querySnapshot = await getDocs(collection(db, 'blogs'));
  const blogs: Blog[] = [];
  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    const authorDoc = await getDoc(doc(db, 'users', data.authorId));
    const authorData = authorDoc.exists() ? { id: authorDoc.id, ...authorDoc.data() } : null;
    blogs.push({
      id: docSnap.id,
      ...data,
      publishedAt: convertTimestamp(data.publishedAt),
      tags: data.tags || [],
      likedBy: data.likedBy || [],
      comments: data.comments || [],
      author: authorData as Alumni,
    } as Blog);
  }
  return blogs.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};

export const getBlogs = async (authorId?: string): Promise<Blog[]> => {
  try {
    const constraints: QueryConstraint[] = [];
    if (authorId) {
      constraints.push(where('authorId', '==', authorId));
    } else {
      constraints.push(where('status', '==', 'published'));
    }
    
    // Try with orderBy first, fallback to without if index is missing
    try {
      constraints.push(orderBy('publishedAt', 'desc'));
      const q = query(collection(db, 'blogs'), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const blogs: Blog[] = [];
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        // Fetch author data
        const authorDoc = await getDoc(doc(db, 'users', data.authorId));
        const authorData = authorDoc.exists() ? { id: authorDoc.id, ...authorDoc.data() } : null;
        
        blogs.push({
          id: docSnap.id,
          ...data,
          publishedAt: convertTimestamp(data.publishedAt),
          tags: data.tags || [],
          likedBy: data.likedBy || [],
          comments: data.comments || [],
          author: authorData as Alumni,
        } as Blog);
      }

      const visible = authorId
        ? blogs
        : blogs.filter(
            (b) =>
              (!b.status || b.status === 'published') && b.moderationStatus !== 'removed'
          );
      return mergeDisplayBlogs(visible, authorId);
    } catch (orderByError: any) {
      // If orderBy fails (likely missing index), try without it
      if (orderByError.code === 'failed-precondition' || orderByError.message?.includes('index')) {
        console.warn('Index missing for orderBy, fetching without sorting:', orderByError.message);
        const constraintsWithoutOrder: QueryConstraint[] = [];
        if (authorId) {
          constraintsWithoutOrder.push(where('authorId', '==', authorId));
        } else {
          constraintsWithoutOrder.push(where('status', '==', 'published'));
        }
        const q = query(collection(db, 'blogs'), ...constraintsWithoutOrder);
        const querySnapshot = await getDocs(q);
        
        const blogs: Blog[] = [];
        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          // Fetch author data
          const authorDoc = await getDoc(doc(db, 'users', data.authorId));
          const authorData = authorDoc.exists() ? { id: authorDoc.id, ...authorDoc.data() } : null;
          
          blogs.push({
            id: docSnap.id,
            ...data,
            publishedAt: convertTimestamp(data.publishedAt),
            tags: data.tags || [],
            likedBy: data.likedBy || [],
            comments: data.comments || [],
            author: authorData as Alumni,
          } as Blog);
        }

        const visible = authorId
          ? blogs
          : blogs.filter(
              (b) =>
                (!b.status || b.status === 'published') && b.moderationStatus !== 'removed'
            );
        const sorted = visible.sort((a, b) => {
          const aDate = new Date(a.publishedAt).getTime();
          const bDate = new Date(b.publishedAt).getTime();
          return bDate - aDate;
        });
        return mergeDisplayBlogs(sorted, authorId);
      }
      throw orderByError;
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch blogs');
  }
};

export const getBlogById = async (blogId: string): Promise<Blog | null> => {
  const local = getLocalBlogById(blogId);
  if (local) return local;

  const mock = findMockBlogById(blogId);
  if (mock) return mock;

  try {
    const docRef = doc(db, 'blogs', blogId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    // Fetch author data
    const authorDoc = await getDoc(doc(db, 'users', data.authorId));
    const authorData = authorDoc.exists() ? { id: authorDoc.id, ...authorDoc.data() } : null;
    
    return {
      id: docSnap.id,
      ...data,
      publishedAt: convertTimestamp(data.publishedAt),
      tags: data.tags || [],
      likedBy: data.likedBy || [],
      comments: data.comments || [],
      author: authorData as Alumni,
    } as Blog;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch blog');
  }
};

export const createBlog = async (blogData: Omit<Blog, 'id' | 'author'>): Promise<string> => {
  try {
    const status = blogData.status || 'published';
    const data: Record<string, unknown> = {
      ...prepareForFirestore({ ...blogData, status }),
      likes: blogData.likes || 0,
      likedBy: blogData.likedBy || [],
      comments: blogData.comments || [],
      shares: blogData.shares || 0,
      moderationStatus: blogData.moderationStatus || 'ok',
      publishedAt: Timestamp.now(),
    };
    if (status === 'draft') {
      data.status = 'draft';
    } else {
      data.status = 'published';
    }

    const docRef = await addDoc(collection(db, 'blogs'), data);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create blog');
  }
};

export const updateBlog = async (blogId: string, updates: Partial<Blog>): Promise<void> => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, prepareForFirestore(updates));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update blog');
  }
};

export const deleteBlog = async (blogId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'blogs', blogId));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete blog');
  }
};

export const addBlogComment = async (
  blogId: string,
  comment: Pick<Comment, 'content' | 'authorId'>
): Promise<void> => {
  if (blogId.startsWith('local-')) {
    if (!getLocalBlogById(blogId)) throw new Error('Blog not found');
    const authorUser = await getUserById(comment.authorId);
    const c: Comment = {
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      content: comment.content,
      authorId: comment.authorId,
      blogId,
      author: authorUser || ({ id: comment.authorId } as User),
      createdAt: new Date().toISOString(),
    };
    appendLocalBlogComment(blogId, c);
    return;
  }

  if (findMockBlogById(blogId)) {
    throw new Error('Comments on featured demo posts are not saved. Publish your own post from the dashboard.');
  }

  const blogRef = doc(db, 'blogs', blogId);
  const snap = await getDoc(blogRef);
  if (!snap.exists()) throw new Error('Blog not found');
  const prev = snap.data().comments || [];
  const newComment: Comment = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    content: comment.content,
    authorId: comment.authorId,
    blogId,
    author: {} as User,
    createdAt: new Date().toISOString(),
  };
  await updateDoc(blogRef, { comments: [...prev, newComment] });
};

export const likeBlog = async (blogId: string, userId: string): Promise<void> => {
  try {
    if (blogId.startsWith('local-')) {
      const updated = updateLocalBlogLikes(blogId, userId);
      if (!updated) throw new Error('Blog not found');
      return;
    }

    if (findMockBlogById(blogId)) {
      throw new Error('DEMO_POST');
    }

    const blogRef = doc(db, 'blogs', blogId);
    const blogSnap = await getDoc(blogRef);
    
    if (!blogSnap.exists()) {
      throw new Error('Blog not found');
    }
    
    const data = blogSnap.data();
    const likedBy = data.likedBy || [];
    const isLiked = likedBy.includes(userId);
    
    if (isLiked) {
      // Unlike
      await updateDoc(blogRef, {
        likes: (data.likes || 0) - 1,
        likedBy: likedBy.filter((id: string) => id !== userId),
      });
    } else {
      // Like
      await updateDoc(blogRef, {
        likes: (data.likes || 0) + 1,
        likedBy: [...likedBy, userId],
      });
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to like blog');
  }
};

// ==================== ACHIEVEMENTS ====================

export const getAchievements = async (userId: string): Promise<Achievement[]> => {
  try {
    // Try with orderBy first, fallback to without if index is missing
    try {
      const q = query(
        collection(db, 'achievements'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
      })) as Achievement[];
    } catch (orderByError: any) {
      if (orderByError.code === 'failed-precondition' || orderByError.message?.includes('index')) {
        console.warn('Index missing for achievements orderBy, fetching without sorting:', orderByError.message);
        const q = query(
          collection(db, 'achievements'),
          where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const achievements = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
          date: convertTimestamp(doc.data().date),
        })) as Achievement[];
        // Sort manually by date desc
        return achievements.sort((a, b) => {
          const aDate = new Date(a.date).getTime();
          const bDate = new Date(b.date).getTime();
          return bDate - aDate;
        });
      }
      throw orderByError;
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch achievements');
  }
};

export const createAchievement = async (achievementData: Omit<Achievement, 'id'>): Promise<string> => {
  try {
    const data = {
      ...prepareForFirestore(achievementData),
      date: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'achievements'), data);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create achievement');
  }
};

export const updateAchievement = async (achievementId: string, updates: Partial<Achievement>): Promise<void> => {
  try {
    const achievementRef = doc(db, 'achievements', achievementId);
    await updateDoc(achievementRef, prepareForFirestore(updates));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update achievement');
  }
};

export const deleteAchievement = async (achievementId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'achievements', achievementId));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete achievement');
  }
};

// ==================== USERS ====================

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
    } as User;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch user');
  }
};

export const getUsers = async (role?: string, collegeId?: string): Promise<User[]> => {
  try {
    const constraints: QueryConstraint[] = [];
    if (role) {
      constraints.push(where('role', '==', role));
    }
    if (collegeId) {
      constraints.push(where('collegeId', '==', collegeId));
    }
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(collection(db, 'users'), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
    })) as User[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch users');
  }
};

/** Full user list for admin dashboards — avoids composite index when unfiltered */
export const getAllUsersAdmin = async (): Promise<User[]> => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  const users = querySnapshot.docs.map((d: QueryDocumentSnapshot) => ({
    id: d.id,
    ...d.data(),
    createdAt: convertTimestamp(d.data().createdAt),
  })) as User[];
  return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// ==================== CONNECTIONS ====================

export const getConnections = async (userId: string): Promise<Connection[]> => {
  try {
    const q = query(
      collection(db, 'connections'),
      where('requesterId', '==', userId),
      where('status', '==', 'accepted')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
    })) as Connection[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch connections');
  }
};

export const createConnection = async (connectionData: Omit<Connection, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const data = {
      ...prepareForFirestore(connectionData),
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'connections'), data);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create connection');
  }
};

// ==================== MESSAGES ====================

export const createMessage = async (messageData: Omit<Message, 'id' | 'createdAt' | 'read' | 'deletedBy'>): Promise<string> => {
  try {
    const data = {
      ...prepareForFirestore(messageData),
      read: false,
      deletedBy: [],
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'messages'), data);

    try {
      await addDoc(collection(db, 'notifications'), {
        userId: messageData.receiverId,
        type: 'message',
        messageId: docRef.id,
        actorId: messageData.senderId,
        title: 'New message',
        body: 'You have a new direct message.',
        read: false,
        createdAt: Timestamp.now(),
      });
    } catch (notifError) {
      if (import.meta.env.DEV) {
        console.error('Failed to create notification:', notifError);
      }
    }
    
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create message');
  }
};

export const getPendingConnections = async (userId: string): Promise<Connection[]> => {
  try {
    const q = query(
      collection(db, 'connections'),
      where('receiverId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
    })) as Connection[];
  } catch (error: any) {
    // Fallback if index is missing
    try {
      const q = query(
        collection(db, 'connections'),
        where('receiverId', '==', userId),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      const connections = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      })) as Connection[];
      return connections.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (fallbackError: any) {
      throw new Error(fallbackError.message || 'Failed to fetch pending connections');
    }
  }
};

export const getAllConnections = async (userId: string): Promise<Connection[]> => {
  try {
    // Try with orderBy first
    try {
      const q = query(
        collection(db, 'connections'),
        where('requesterId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const requesterConnections = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      })) as Connection[];

      const q2 = query(
        collection(db, 'connections'),
        where('receiverId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot2 = await getDocs(q2);
      
      const receiverConnections = querySnapshot2.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      })) as Connection[];

      return [...requesterConnections, ...receiverConnections].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (orderByError: any) {
      // Fallback if index is missing
      if (orderByError.code === 'failed-precondition' || orderByError.message?.includes('index')) {
        const q = query(
          collection(db, 'connections'),
          where('requesterId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        
        const requesterConnections = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: convertTimestamp(doc.data().createdAt),
        })) as Connection[];

        const q2 = query(
          collection(db, 'connections'),
          where('receiverId', '==', userId)
        );
        const querySnapshot2 = await getDocs(q2);
        
        const receiverConnections = querySnapshot2.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: convertTimestamp(doc.data().createdAt),
        })) as Connection[];

        return [...requesterConnections, ...receiverConnections].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      throw orderByError;
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch connections');
  }
};

export const updateConnection = async (connectionId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  try {
    const connectionRef = doc(db, 'connections', connectionId);
    await updateDoc(connectionRef, { status });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update connection');
  }
};

export const getConnectionStatus = async (userId1: string, userId2: string): Promise<Connection | null> => {
  try {
    const q1 = query(
      collection(db, 'connections'),
      where('requesterId', '==', userId1),
      where('receiverId', '==', userId2)
    );
    const snapshot1 = await getDocs(q1);
    
    if (!snapshot1.empty) {
      const doc = snapshot1.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      } as Connection;
    }

    const q2 = query(
      collection(db, 'connections'),
      where('requesterId', '==', userId2),
      where('receiverId', '==', userId1)
    );
    const snapshot2 = await getDocs(q2);
    
    if (!snapshot2.empty) {
      const doc = snapshot2.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      } as Connection;
    }

    return null;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get connection status');
  }
};

export const getMessages = async (userId1: string, userId2: string): Promise<Message[]> => {
  try {
    // Get messages where userId1 is sender and userId2 is receiver
    const q1 = query(
      collection(db, 'messages'),
      where('senderId', '==', userId1),
      where('receiverId', '==', userId2),
      orderBy('createdAt', 'asc')
    );
    
    // Get messages where userId2 is sender and userId1 is receiver
    const q2 = query(
      collection(db, 'messages'),
      where('senderId', '==', userId2),
      where('receiverId', '==', userId1),
      orderBy('createdAt', 'asc')
    );
    
    let snapshot1, snapshot2;
    try {
      [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);
    } catch (orderByError: any) {
      // Fallback if index is missing
      if (orderByError.code === 'failed-precondition' || orderByError.message?.includes('index')) {
        console.warn('Index missing for messages orderBy, fetching without sorting:', orderByError.message);
        
        // Get messages without orderBy
        const q1Fallback = query(
          collection(db, 'messages'),
          where('senderId', '==', userId1),
          where('receiverId', '==', userId2)
        );
        
        const q2Fallback = query(
          collection(db, 'messages'),
          where('senderId', '==', userId2),
          where('receiverId', '==', userId1)
        );
        
        [snapshot1, snapshot2] = await Promise.all([
          getDocs(q1Fallback).catch(() => ({ docs: [] })),
          getDocs(q2Fallback).catch(() => ({ docs: [] }))
        ]);
      } else {
        throw orderByError;
      }
    }
    
    const messages = [
      ...snapshot1.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        read: doc.data().read ?? false,
        deletedBy: doc.data().deletedBy ?? [],
        readAt: doc.data().readAt ? convertTimestamp(doc.data().readAt) : undefined,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      })),
      ...snapshot2.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        read: doc.data().read ?? false,
        deletedBy: doc.data().deletedBy ?? [],
        readAt: doc.data().readAt ? convertTimestamp(doc.data().readAt) : undefined,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      }))
    ] as Message[];
    
    // Filter out messages deleted by the current user
    const filteredMessages = messages.filter(msg => 
      !msg.deletedBy || !msg.deletedBy.includes(userId1)
    );
    
    // Sort by createdAt
    return filteredMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch messages');
  }
};

export const getAllConversations = async (userId: string): Promise<{ userId: string; lastMessage: Message; unreadCount: number }[]> => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('senderId', '==', userId)
    );
    const sentSnapshot = await getDocs(q);
    
    const q2 = query(
      collection(db, 'messages'),
      where('receiverId', '==', userId)
    );
    const receivedSnapshot = await getDocs(q2);
    
    const allMessages = [
      ...sentSnapshot.docs.map(doc => ({
        id: doc.id,
        read: doc.data().read ?? false,
        deletedBy: doc.data().deletedBy ?? [],
        readAt: doc.data().readAt ? convertTimestamp(doc.data().readAt) : undefined,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt)
      }) as Message),
      ...receivedSnapshot.docs.map(doc => ({
        id: doc.id,
        read: doc.data().read ?? false,
        deletedBy: doc.data().deletedBy ?? [],
        readAt: doc.data().readAt ? convertTimestamp(doc.data().readAt) : undefined,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt)
      }) as Message)
    ];
    
    // Filter out messages deleted by current user
    const visibleMessages = allMessages.filter(msg => 
      !msg.deletedBy || !msg.deletedBy.includes(userId)
    );
    
    const conversationsMap = new Map<string, { lastMessage: Message; unreadCount: number }>();
    
    visibleMessages.forEach((msg: Message) => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const existing = conversationsMap.get(otherUserId);
      
      // Count unread messages (only messages received by current user that are unread)
      const isUnread = msg.receiverId === userId && !msg.read;
      
      if (!existing || new Date(msg.createdAt) > new Date(existing.lastMessage.createdAt)) {
        conversationsMap.set(otherUserId, {
          lastMessage: msg,
          unreadCount: isUnread ? 1 : 0
        });
      } else if (isUnread) {
        existing.unreadCount += 1;
      }
    });
    
    // Recalculate unread counts properly
    const conversations = Array.from(conversationsMap.entries()).map(([otherUserId, data]) => {
      // Count all unread messages from this conversation
      const unreadCount = visibleMessages.filter(msg => {
        const msgOtherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        return msgOtherUserId === otherUserId && msg.receiverId === userId && !msg.read;
      }).length;
      
      return {
        userId: otherUserId,
        lastMessage: data.lastMessage,
        unreadCount
      };
    });
    
    return conversations;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch conversations');
  }
};

// Real-time listeners
export const subscribeToPendingConnections = (
  userId: string,
  callback: (connections: Connection[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'connections'),
    where('receiverId', '==', userId),
    where('status', '==', 'pending')
  );
  
  return onSnapshot(q, (snapshot) => {
    const connections = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
    })) as Connection[];
    callback(connections);
  });
};

export const subscribeToMessages = (
  userId1: string,
  userId2: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  // Create two separate queries for the conversation
  const q1 = query(
    collection(db, 'messages'),
    where('senderId', '==', userId1),
    where('receiverId', '==', userId2)
  );
  
  const q2 = query(
    collection(db, 'messages'),
    where('senderId', '==', userId2),
    where('receiverId', '==', userId1)
  );
  
  let unsubscribe1: Unsubscribe;
  let unsubscribe2: Unsubscribe;
  
  const allMessages: Message[] = [];
  
  const updateMessages = () => {
    // Filter and combine messages
    const filtered = allMessages.filter((msg: Message) => 
      ((msg.senderId === userId1 && msg.receiverId === userId2) ||
       (msg.senderId === userId2 && msg.receiverId === userId1)) &&
      (!msg.deletedBy || !msg.deletedBy.includes(userId1))
    );
    
    // Sort by createdAt
    const sorted = filtered.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    callback(sorted);
  };
  
  unsubscribe1 = onSnapshot(q1, (snapshot) => {
    // Update messages from query 1
    snapshot.docs.forEach(doc => {
      const index = allMessages.findIndex(m => m.id === doc.id);
      const message = {
        id: doc.id,
        read: doc.data().read ?? false,
        deletedBy: doc.data().deletedBy ?? [],
        readAt: doc.data().readAt ? convertTimestamp(doc.data().readAt) : undefined,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      } as Message;
      
      if (index >= 0) {
        allMessages[index] = message;
      } else {
        allMessages.push(message);
      }
    });
    
    // Remove deleted messages
    const docIds = new Set(snapshot.docs.map(d => d.id));
    for (let i = allMessages.length - 1; i >= 0; i--) {
      if (allMessages[i].senderId === userId1 && allMessages[i].receiverId === userId2 && !docIds.has(allMessages[i].id)) {
        allMessages.splice(i, 1);
      }
    }
    
    updateMessages();
  }, (error) => {
    console.error('Error in messages subscription:', error);
  });
  
  unsubscribe2 = onSnapshot(q2, (snapshot) => {
    // Update messages from query 2
    snapshot.docs.forEach(doc => {
      const index = allMessages.findIndex(m => m.id === doc.id);
      const message = {
        id: doc.id,
        read: doc.data().read ?? false,
        deletedBy: doc.data().deletedBy ?? [],
        readAt: doc.data().readAt ? convertTimestamp(doc.data().readAt) : undefined,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      } as Message;
      
      if (index >= 0) {
        allMessages[index] = message;
      } else {
        allMessages.push(message);
      }
    });
    
    // Remove deleted messages
    const docIds = new Set(snapshot.docs.map(d => d.id));
    for (let i = allMessages.length - 1; i >= 0; i--) {
      if (allMessages[i].senderId === userId2 && allMessages[i].receiverId === userId1 && !docIds.has(allMessages[i].id)) {
        allMessages.splice(i, 1);
      }
    }
    
    updateMessages();
  }, (error) => {
    console.error('Error in messages subscription:', error);
  });
  
  return () => {
    unsubscribe1();
    unsubscribe2();
  };
};

// Mark message as read
export const markMessageAsRead = async (messageId: string, userId: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }
    
    const messageData = messageDoc.data();
    // Only mark as read if the current user is the receiver
    if (messageData.receiverId === userId && !messageData.read) {
      await updateDoc(messageRef, {
        read: true,
        readAt: Timestamp.now(),
      });
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark message as read');
  }
};

// Mark all messages in a conversation as read
export const markConversationAsRead = async (userId1: string, userId2: string): Promise<void> => {
  try {
    // Get all unread messages where current user is receiver
    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', userId1),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const batch = snapshot.docs
      .filter(doc => {
        const data = doc.data();
        return (data.senderId === userId2 || data.receiverId === userId2);
      })
      .map(doc => updateDoc(doc.ref, {
        read: true,
        readAt: Timestamp.now(),
      }));
    
    await Promise.all(batch);
  } catch (error: any) {
    console.error('Error marking conversation as read:', error);
    // Don't throw, just log the error
  }
};

// Delete a message (soft delete - add user to deletedBy array)
export const deleteMessage = async (messageId: string, userId: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }
    
    const messageData = messageDoc.data();
    const deletedBy = messageData.deletedBy || [];
    
    // Only allow deletion if user is sender or receiver
    if (messageData.senderId !== userId && messageData.receiverId !== userId) {
      throw new Error('Unauthorized to delete this message');
    }
    
    // Add user to deletedBy array if not already there
    if (!deletedBy.includes(userId)) {
      await updateDoc(messageRef, {
        deletedBy: [...deletedBy, userId],
      });
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete message');
  }
};

// Subscribe to conversations list for real-time updates
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: { userId: string; lastMessage: Message; unreadCount: number }[]) => void
): Unsubscribe => {
  // Subscribe to all messages where user is sender or receiver
  const q1 = query(
    collection(db, 'messages'),
    where('senderId', '==', userId)
  );
  
  const q2 = query(
    collection(db, 'messages'),
    where('receiverId', '==', userId)
  );
  
  let unsubscribe1: Unsubscribe;
  let unsubscribe2: Unsubscribe;
  
  const updateConversations = async () => {
    try {
      const conversations = await getAllConversations(userId);
      callback(conversations);
    } catch (error) {
      console.error('Error updating conversations:', error);
    }
  };
  
  unsubscribe1 = onSnapshot(q1, updateConversations);
  unsubscribe2 = onSnapshot(q2, updateConversations);
  
  // Initial load
  updateConversations();
  
  return () => {
    unsubscribe1();
    unsubscribe2();
  };
};
