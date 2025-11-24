/**
 * CRUD Operations Examples for Firebase Firestore
 * 
 * This file demonstrates all CRUD operations (Create, Read, Update, Delete)
 * for different collections in the Reconnect app.
 */

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

// ==================== ALUMNI CRUD OPERATIONS ====================

/**
 * CREATE - Add new alumni
 */
export const addAlumniExample = async () => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      name: 'Uddhav Joshi',
      email: 'uddhav@example.com',
      role: 'alumni',
      graduationYear: 2025,
      degree: 'Bachelor of Technology',
      department: 'Computer Science',
      domain: 'Frontend',
      skills: ['React', 'TypeScript', 'Next.js'],
      createdAt: new Date().toISOString(),
    });
    console.log('Alumni added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding alumni: ', error);
    throw error;
  }
};

/**
 * READ - Get all alumni
 */
export const getAlumniExample = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const alumni: any[] = [];
    
    querySnapshot.forEach((doc) => {
      if (doc.data().role === 'alumni') {
        alumni.push({
          id: doc.id,
          ...doc.data(),
        });
      }
    });
    
    console.log('Alumni data:', alumni);
    return alumni;
  } catch (error) {
    console.error('Error getting alumni: ', error);
    throw error;
  }
};

/**
 * READ - Get alumni by ID
 */
export const getAlumniByIdExample = async (alumniId: string) => {
  try {
    const docRef = doc(db, 'users', alumniId);
    const docSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', alumniId)));
    
    if (!docSnap.empty) {
      const alumniData = { id: docSnap.docs[0].id, ...docSnap.docs[0].data() };
      console.log('Alumni data:', alumniData);
      return alumniData;
    } else {
      console.log('No such alumni!');
      return null;
    }
  } catch (error) {
    console.error('Error getting alumni: ', error);
    throw error;
  }
};

/**
 * UPDATE - Update alumni document
 */
export const updateAlumniExample = async (alumniId: string) => {
  try {
    const alumniRef = doc(db, 'users', alumniId);
    await updateDoc(alumniRef, {
      domain: 'Full Stack Developer',
      skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'MongoDB'],
      updatedAt: new Date().toISOString(),
    });
    console.log('Alumni updated successfully!');
  } catch (error) {
    console.error('Error updating alumni: ', error);
    throw error;
  }
};

/**
 * DELETE - Delete alumni document
 */
export const deleteAlumniExample = async (alumniId: string) => {
  try {
    await deleteDoc(doc(db, 'users', alumniId));
    console.log('Alumni deleted successfully!');
  } catch (error) {
    console.error('Error deleting alumni: ', error);
    throw error;
  }
};

// ==================== BLOGS CRUD OPERATIONS ====================

/**
 * CREATE - Add new blog
 */
export const addBlogExample = async () => {
  try {
    const docRef = await addDoc(collection(db, 'blogs'), {
      title: 'My Journey in Tech',
      content: 'This is my blog content...',
      excerpt: 'A brief excerpt',
      authorId: 'user123',
      tags: ['tech', 'career'],
      publishedAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: [],
      shares: 0,
    });
    console.log('Blog added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding blog: ', error);
    throw error;
  }
};

/**
 * READ - Get all blogs
 */
export const getBlogsExample = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'blogs'));
    const blogs: any[] = [];
    
    querySnapshot.forEach((doc) => {
      blogs.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    console.log('Blogs data:', blogs);
    return blogs;
  } catch (error) {
    console.error('Error getting blogs: ', error);
    throw error;
  }
};

/**
 * UPDATE - Update blog document
 */
export const updateBlogExample = async (blogId: string) => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, {
      title: 'Updated Blog Title',
      updatedAt: new Date().toISOString(),
    });
    console.log('Blog updated successfully!');
  } catch (error) {
    console.error('Error updating blog: ', error);
    throw error;
  }
};

/**
 * DELETE - Delete blog document
 */
export const deleteBlogExample = async (blogId: string) => {
  try {
    await deleteDoc(doc(db, 'blogs', blogId));
    console.log('Blog deleted successfully!');
  } catch (error) {
    console.error('Error deleting blog: ', error);
    throw error;
  }
};

// ==================== COLLEGES CRUD OPERATIONS ====================

/**
 * CREATE - Add new college
 */
export const addCollegeExample = async () => {
  try {
    const docRef = await addDoc(collection(db, 'colleges'), {
      name: 'College of Engineering',
      description: 'Premier engineering college',
      departments: ['Computer Science', 'Electrical Engineering'],
      universityId: '1',
      createdAt: new Date().toISOString(),
    });
    console.log('College added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding college: ', error);
    throw error;
  }
};

/**
 * READ - Get all colleges
 */
export const getCollegesExample = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'colleges'));
    const colleges: any[] = [];
    
    querySnapshot.forEach((doc) => {
      colleges.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    console.log('Colleges data:', colleges);
    return colleges;
  } catch (error) {
    console.error('Error getting colleges: ', error);
    throw error;
  }
};

/**
 * UPDATE - Update college document
 */
export const updateCollegeExample = async (collegeId: string) => {
  try {
    const collegeRef = doc(db, 'colleges', collegeId);
    await updateDoc(collegeRef, {
      description: 'Updated description',
      updatedAt: new Date().toISOString(),
    });
    console.log('College updated successfully!');
  } catch (error) {
    console.error('Error updating college: ', error);
    throw error;
  }
};

/**
 * DELETE - Delete college document
 */
export const deleteCollegeExample = async (collegeId: string) => {
  try {
    await deleteDoc(doc(db, 'colleges', collegeId));
    console.log('College deleted successfully!');
  } catch (error) {
    console.error('Error deleting college: ', error);
    throw error;
  }
};

// ==================== ACHIEVEMENTS CRUD OPERATIONS ====================

/**
 * CREATE - Add new achievement
 */
export const addAchievementExample = async () => {
  try {
    const docRef = await addDoc(collection(db, 'achievements'), {
      title: 'Best Employee of the Year',
      description: 'Recognized for outstanding performance',
      date: new Date().toISOString(),
      category: 'professional',
      userId: 'user123',
    });
    console.log('Achievement added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding achievement: ', error);
    throw error;
  }
};

/**
 * READ - Get achievements by user
 */
export const getAchievementsExample = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'achievements'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const achievements: any[] = [];
    
    querySnapshot.forEach((doc) => {
      achievements.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    console.log('Achievements data:', achievements);
    return achievements;
  } catch (error) {
    console.error('Error getting achievements: ', error);
    throw error;
  }
};

/**
 * UPDATE - Update achievement document
 */
export const updateAchievementExample = async (achievementId: string) => {
  try {
    const achievementRef = doc(db, 'achievements', achievementId);
    await updateDoc(achievementRef, {
      title: 'Updated Achievement Title',
      updatedAt: new Date().toISOString(),
    });
    console.log('Achievement updated successfully!');
  } catch (error) {
    console.error('Error updating achievement: ', error);
    throw error;
  }
};

/**
 * DELETE - Delete achievement document
 */
export const deleteAchievementExample = async (achievementId: string) => {
  try {
    await deleteDoc(doc(db, 'achievements', achievementId));
    console.log('Achievement deleted successfully!');
  } catch (error) {
    console.error('Error deleting achievement: ', error);
    throw error;
  }
};

// ==================== USAGE EXAMPLES ====================

/**
 * Example: Complete CRUD workflow for alumni
 */
export const alumniCRUDExample = async () => {
  try {
    // CREATE
    const alumniId = await addAlumniExample();
    
    // READ
    const allAlumni = await getAlumniExample();
    const specificAlumni = await getAlumniByIdExample(alumniId);
    
    // UPDATE
    await updateAlumniExample(alumniId);
    
    // DELETE (commented out to prevent accidental deletion)
    // await deleteAlumniExample(alumniId);
    
    console.log('CRUD operations completed successfully!');
  } catch (error) {
    console.error('Error in CRUD operations: ', error);
  }
};

