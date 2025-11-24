# CRUD Operations Guide

This document explains all Create, Read, Update, Delete (CRUD) operations available in the Reconnect application.

## 📚 Available CRUD Operations

### ✅ Alumni Operations

#### CREATE - Add New Alumni
```typescript
import { createAlumni } from './services/firebaseFirestore';

const newAlumni = {
  name: 'Uddhav Joshi',
  email: 'uddhav@example.com',
  role: 'alumni',
  graduationYear: 2025,
  degree: 'Bachelor of Technology',
  department: 'Computer Science',
  skills: ['React', 'TypeScript'],
  // ... other fields
};

const alumniId = await createAlumni(newAlumni);
```

#### READ - Get Alumni
```typescript
import { getAlumni, getAlumniById } from './services/firebaseFirestore';

// Get all alumni
const allAlumni = await getAlumni();

// Get alumni by college
const collegeAlumni = await getAlumni('collegeId123');

// Get alumni by ID
const alumni = await getAlumniById('alumniId123');
```

#### UPDATE - Update Alumni
```typescript
import { updateAlumni } from './services/firebaseFirestore';

await updateAlumni('alumniId123', {
  domain: 'Full Stack Developer',
  skills: ['React', 'TypeScript', 'Node.js'],
  currentCompany: 'Google',
});
```

#### DELETE - Delete Alumni
```typescript
import { deleteAlumni } from './services/firebaseFirestore';

await deleteAlumni('alumniId123');
```

---

### ✅ Blog Operations

#### CREATE - Add New Blog
```typescript
import { createBlog } from './services/firebaseFirestore';

const newBlog = {
  title: 'My Journey in Tech',
  content: 'Blog content...',
  excerpt: 'Brief excerpt',
  authorId: 'user123',
  tags: ['tech', 'career'],
};

const blogId = await createBlog(newBlog);
```

#### READ - Get Blogs
```typescript
import { getBlogs, getBlogById } from './services/firebaseFirestore';

// Get all blogs
const allBlogs = await getBlogs();

// Get blogs by author
const userBlogs = await getBlogs('authorId123');

// Get blog by ID
const blog = await getBlogById('blogId123');
```

#### UPDATE - Update Blog
```typescript
import { updateBlog } from './services/firebaseFirestore';

await updateBlog('blogId123', {
  title: 'Updated Blog Title',
  content: 'Updated content...',
});
```

#### DELETE - Delete Blog
```typescript
import { deleteBlog } from './services/firebaseFirestore';

await deleteBlog('blogId123');
```

---

### ✅ College Operations

#### CREATE - Add New College
```typescript
import { createCollege } from './services/firebaseFirestore';

const newCollege = {
  name: 'College of Engineering',
  description: 'Premier engineering college',
  departments: ['CS', 'EE'],
  universityId: '1',
};

const collegeId = await createCollege(newCollege);
```

#### READ - Get Colleges
```typescript
import { getColleges, getCollege } from './services/firebaseFirestore';

// Get all colleges
const allColleges = await getColleges();

// Get colleges by university
const universityColleges = await getColleges('universityId123');

// Get college by ID
const college = await getCollege('collegeId123');
```

#### UPDATE - Update College
```typescript
import { updateCollege } from './services/firebaseFirestore';

await updateCollege('collegeId123', {
  description: 'Updated description',
  departments: ['CS', 'EE', 'ME'],
});
```

#### DELETE - Delete College
```typescript
import { deleteCollege } from './services/firebaseFirestore';

await deleteCollege('collegeId123');
```

---

### ✅ Achievement Operations

#### CREATE - Add Achievement
```typescript
import { createAchievement } from './services/firebaseFirestore';

const newAchievement = {
  title: 'Best Employee',
  description: 'Outstanding performance',
  date: new Date().toISOString(),
  category: 'professional',
  userId: 'user123',
};

const achievementId = await createAchievement(newAchievement);
```

#### READ - Get Achievements
```typescript
import { getAchievements } from './services/firebaseFirestore';

const achievements = await getAchievements('userId123');
```

#### UPDATE - Update Achievement
```typescript
import { updateAchievement } from './services/firebaseFirestore';

await updateAchievement('achievementId123', {
  title: 'Updated Title',
  description: 'Updated description',
});
```

#### DELETE - Delete Achievement
```typescript
import { deleteAchievement } from './services/firebaseFirestore';

await deleteAchievement('achievementId123');
```

---

## 🎨 UI Integration

### Sub Admin Dashboard

The Sub Admin Dashboard now includes:

1. **Alumni Management**
   - ✅ CREATE: "ADD ALUMNI" button opens AddAlumniForm
   - ✅ READ: Displays all college alumni
   - ✅ UPDATE: "EDIT" button opens EditAlumniForm
   - ✅ DELETE: "DELETE" button with confirmation

2. **Blog Management**
   - ✅ READ: Displays all college blogs
   - ✅ DELETE: "DELETE" button with confirmation

### How to Use in UI

#### Edit Alumni
1. Go to Sub Admin Dashboard
2. Find the alumni you want to edit
3. Click "EDIT" button
4. Modify the information in the form
5. Click "UPDATE ALUMNI PROFILE"

#### Delete Alumni
1. Go to Sub Admin Dashboard
2. Find the alumni you want to delete
3. Click "DELETE" button
4. Confirm the deletion
5. Alumni will be removed from database

#### Delete Blog
1. Go to Sub Admin Dashboard
2. Find the blog you want to delete
3. Click "DELETE" button
4. Confirm the deletion
5. Blog will be removed from database

---

## 📝 Code Examples File

See `src/services/crudExamples.ts` for complete working examples of all CRUD operations.

---

## 🔧 Firebase Functions Used

All operations use Firebase Firestore functions:

- **CREATE**: `addDoc(collection(db, 'collectionName'), data)`
- **READ**: `getDocs(query(collection(db, 'collectionName'), ...))`
- **UPDATE**: `updateDoc(doc(db, 'collectionName', id), updates)`
- **DELETE**: `deleteDoc(doc(db, 'collectionName', id))`

---

## ✅ All CRUD Operations Available

| Entity | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| Alumni | ✅ | ✅ | ✅ | ✅ |
| Blogs | ✅ | ✅ | ✅ | ✅ |
| Colleges | ✅ | ✅ | ✅ | ✅ |
| Achievements | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ | - |
| Connections | ✅ | ✅ | ✅ | - |

---

**All CRUD operations are now fully integrated and ready to use!** 🚀

