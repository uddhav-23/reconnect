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
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { College, Alumni, Blog, Achievement, User, Connection, Message } from '../types';

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

export const getBlogs = async (authorId?: string): Promise<Blog[]> => {
  try {
    const constraints: QueryConstraint[] = [];
    if (authorId) {
      constraints.push(where('authorId', '==', authorId));
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
      
      return blogs;
    } catch (orderByError: any) {
      // If orderBy fails (likely missing index), try without it
      if (orderByError.code === 'failed-precondition' || orderByError.message?.includes('index')) {
        console.warn('Index missing for orderBy, fetching without sorting:', orderByError.message);
        const constraintsWithoutOrder: QueryConstraint[] = [];
        if (authorId) {
          constraintsWithoutOrder.push(where('authorId', '==', authorId));
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
        
        // Sort manually
        return blogs.sort((a, b) => {
          const aDate = new Date(a.publishedAt).getTime();
          const bDate = new Date(b.publishedAt).getTime();
          return bDate - aDate;
        });
      }
      throw orderByError;
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch blogs');
  }
};

export const getBlogById = async (blogId: string): Promise<Blog | null> => {
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
    const data = {
      ...prepareForFirestore(blogData),
      likes: blogData.likes || 0,
      likedBy: blogData.likedBy || [],
      comments: blogData.comments || [],
      shares: blogData.shares || 0,
      publishedAt: Timestamp.now(),
    };
    
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

export const likeBlog = async (blogId: string, userId: string): Promise<void> => {
  try {
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

export const createMessage = async (messageData: Omit<Message, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const data = {
      ...prepareForFirestore(messageData),
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'messages'), data);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create message');
  }
};

