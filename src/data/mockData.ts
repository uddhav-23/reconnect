import { Alumni, University, College, Blog, Achievement, Student, CommonUser, User, Connection } from '../types';

export const mockUniversities: University[] = [
  {
    id: '1',
    name: 'Tech State University',
    location: 'Silicon Valley, CA',
    description: 'Leading technology university with cutting-edge programs',
    colleges: [],
    createdAt: '2024-01-01',
    establishedYear: 1965,
    website: 'https://techstate.edu',
    contactEmail: 'info@techstate.edu',
    phone: '+1-555-0123',
  },
];

export const mockColleges: College[] = [
  {
    id: '1',
    name: 'College of Engineering',
    universityId: '1',
    description: 'Premier engineering college with world-class faculty',
    departments: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering'],
    createdAt: '2024-01-01',
    establishedYear: 1970,
    website: 'https://engineering.techstate.edu',
    contactEmail: 'engineering@techstate.edu',
    phone: '+1-555-0124',
    adminName: 'Dr. Amelia Brown',
    adminEmail: 'admin@college.edu',
    adminPassword: 'admin123',
    adminContactNumber: '+1-555-1100',
  },
  {
    id: '2',
    name: 'College of Business',
    universityId: '1',
    description: 'Business school preparing future leaders',
    departments: ['MBA', 'Finance', 'Marketing'],
    createdAt: '2024-01-01',
    establishedYear: 1975,
    website: 'https://business.techstate.edu',
    contactEmail: 'business@techstate.edu',
    phone: '+1-555-0125',
    adminName: 'Dr. Victor Lee',
    adminEmail: 'business@college.edu',
    adminPassword: 'business123',
    adminContactNumber: '+1-555-2200',
  },
];

export const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Best Employee of the Year',
    description: 'Recognized for outstanding performance and leadership at Google',
    date: '2024-01-15',
    category: 'professional',
    userId: '3',
  },
  {
    id: '2',
    title: 'Published Research Paper',
    description: 'Published groundbreaking research in AI and Machine Learning in Nature journal',
    date: '2023-12-10',
    category: 'academic',
    userId: '3',
  },
  {
    id: '3',
    title: 'Community Service Award',
    description: 'Recognized for 100+ hours of community service in local schools',
    date: '2023-11-20',
    category: 'community',
    userId: '4',
  },
];

export const mockAlumni: Alumni[] = [
  {
    id: '3',
    email: 'alumni@example.com',
    name: 'Mike Johnson',
    role: 'alumni',
    universityId: '1',
    collegeId: '1',
    graduationYear: 2020,
    degree: 'Bachelor of Technology',
    department: 'Computer Science',
    currentCompany: 'Google',
    currentPosition: 'Senior Software Engineer',
    location: 'Mountain View, CA',
    bio: 'Passionate software engineer with expertise in full-stack development and machine learning. Love mentoring young developers and contributing to open-source projects.',
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning'],
    achievements: [],
    blogs: [],
    connections: ['4', '5'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/mikejohnson',
      github: 'https://github.com/mikejohnson',
    },
    createdAt: '2024-01-01',
    phone: '+1-555-0001',
    address: '123 Tech Street, Mountain View, CA 94041',
    experience: [
      {
        id: '1',
        company: 'Google',
        position: 'Senior Software Engineer',
        startDate: '2022-01-01',
        description: 'Leading development of cloud infrastructure solutions',
        current: true,
      },
      {
        id: '2',
        company: 'Microsoft',
        position: 'Software Engineer',
        startDate: '2020-06-01',
        endDate: '2021-12-31',
        description: 'Developed web applications using React and .NET',
        current: false,
      },
    ],
    education: [
      {
        id: '1',
        institution: 'Tech State University',
        degree: 'Bachelor of Technology',
        field: 'Computer Science',
        startYear: 2016,
        endYear: 2020,
        grade: '3.8 GPA',
      },
    ],
  },
  {
    id: '4',
    email: 'sarah@example.com',
    name: 'Sarah Davis',
    role: 'alumni',
    universityId: '1',
    collegeId: '2',
    graduationYear: 2019,
    degree: 'Master of Business Administration',
    department: 'MBA',
    currentCompany: 'Microsoft',
    currentPosition: 'Product Manager',
    location: 'Seattle, WA',
    bio: 'Product management professional with a passion for building user-centric products. Experience in B2B SaaS and consumer applications.',
    skills: ['Product Management', 'Strategy', 'Analytics', 'Leadership'],
    achievements: [],
    blogs: [],
    connections: ['3'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahdavis',
    },
    createdAt: '2024-01-01',
    phone: '+1-555-0002',
    address: '456 Business Ave, Seattle, WA 98101',
    experience: [
      {
        id: '3',
        company: 'Microsoft',
        position: 'Product Manager',
        startDate: '2021-03-01',
        description: 'Managing product roadmap for Office 365 suite',
        current: true,
      },
    ],
    education: [
      {
        id: '2',
        institution: 'Tech State University',
        degree: 'Master of Business Administration',
        field: 'Business Administration',
        startYear: 2017,
        endYear: 2019,
        grade: '3.9 GPA',
      },
    ],
  },
];

export const mockStudents: Student[] = [
  {
    id: '5',
    email: 'student@example.com',
    name: 'Alex Chen',
    role: 'student',
    universityId: '1',
    collegeId: '1',
    currentYear: 3,
    degree: 'Bachelor of Technology',
    department: 'Computer Science',
    rollNumber: 'CS2022001',
    connections: ['3'],
    createdAt: '2024-01-01',
  },
];

export const mockCommonUsers: CommonUser[] = [
  {
    id: '6',
    email: 'user@example.com',
    name: 'John Public',
    role: 'user',
    connections: [],
    interests: ['Technology', 'Networking', 'Career Development'],
    createdAt: '2024-01-01',
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'superadmin@university.edu',
    name: 'John Smith',
    role: 'superadmin',
    createdAt: '2024-01-01',
    password: 'admin123',
  },
  {
    id: '2',
    email: 'admin@college.edu',
    name: 'Jane Doe',
    role: 'subadmin',
    universityId: '1',
    collegeId: '1',
    createdAt: '2024-01-01',
    password: 'admin123',
  },
  ...mockAlumni,
  ...mockStudents,
  ...mockCommonUsers,
];

export const mockBlogs: Blog[] = [
  {
    id: '1',
    title: 'My Journey from Student to Tech Lead',
    content: `# My Journey from Student to Tech Lead

When I first stepped into Tech State University as a Computer Science freshman, I never imagined I'd be leading a team of 15 engineers at Google just four years after graduation. This is the story of my journey, the challenges I faced, and the lessons I learned along the way.

## The Early Days

College was both exciting and overwhelming. The transition from high school to university-level coursework was steep, but I was determined to make the most of it. I spent countless hours in the computer lab, working on projects and learning new programming languages.

### Key Learnings from College:
- **Technical Foundation**: Mastering data structures, algorithms, and system design
- **Collaboration**: Working on group projects taught me the importance of teamwork
- **Problem-Solving**: Every coding challenge made me a better problem solver

## First Job at Microsoft

After graduation, I joined Microsoft as a Software Engineer. The learning curve was steep, but my college foundation helped me adapt quickly. I worked on web applications using React and .NET, which gave me full-stack experience.

### What I Learned:
- **Industry Standards**: Understanding enterprise-level code quality and practices
- **Mentorship**: Having great mentors accelerated my growth
- **User Focus**: Building products that millions of people use daily

## The Move to Google

After two years at Microsoft, I felt ready for a new challenge. Google's culture of innovation and technical excellence attracted me. The interview process was rigorous, but my preparation paid off.

### Current Role Highlights:
- Leading a team of 15 engineers
- Working on cloud infrastructure that serves billions of requests
- Mentoring junior developers and interns
- Contributing to open-source projects

## Advice for Current Students

1. **Build Projects**: Theory is important, but practical experience is invaluable
2. **Network**: Connect with alumni, attend tech meetups, join professional organizations
3. **Never Stop Learning**: Technology evolves rapidly; continuous learning is essential
4. **Find Mentors**: Seek guidance from experienced professionals
5. **Give Back**: Share your knowledge and help others grow

## Looking Forward

My journey is far from over. I'm currently working on launching a new product that could revolutionize how we think about cloud computing. I'm also passionate about diversity in tech and actively mentor underrepresented students.

Remember, every expert was once a beginner. Stay curious, work hard, and don't be afraid to take calculated risks. Your journey might be different from mine, but with dedication and the right mindset, you can achieve your goals.

Feel free to connect with me if you have questions or want to discuss career opportunities in tech!`,
    excerpt: 'A personal story about growth in the tech industry, from college freshman to tech lead at Google.',
    tags: ['career', 'technology', 'leadership', 'google', 'microsoft'],
    authorId: '3',
    author: mockAlumni[0],
    publishedAt: '2024-01-20',
    likes: 45,
    likedBy: ['4', '5'],
    comments: [],
    shares: 12,
  },
  {
    id: '2',
    title: 'Breaking into Product Management',
    content: `# Breaking into Product Management: A Complete Guide

Product Management is one of the most sought-after roles in tech, but it's also one of the most misunderstood. After three years as a Product Manager at Microsoft, I want to share insights on how to break into this exciting field.

## What is Product Management?

Product Management sits at the intersection of business, technology, and user experience. As a PM, you're responsible for:

- **Vision & Strategy**: Defining what to build and why
- **Roadmap Planning**: Prioritizing features and timeline
- **Cross-functional Leadership**: Working with engineering, design, marketing, and sales
- **Data Analysis**: Making decisions based on user feedback and metrics
- **Stakeholder Communication**: Keeping everyone aligned and informed

## Skills You Need

### Technical Skills:
- Understanding of software development processes
- Data analysis and interpretation
- Basic knowledge of design principles
- Familiarity with project management tools

### Soft Skills:
- **Communication**: Clearly articulating vision and requirements
- **Leadership**: Influencing without authority
- **Problem-Solving**: Breaking down complex problems
- **Empathy**: Understanding user needs and pain points

## How to Get Started

### 1. Build Relevant Experience
- Take on product-related projects in your current role
- Volunteer for cross-functional initiatives
- Start a side project or app

### 2. Learn the Fundamentals
- Read product management books (Inspired, Cracking the PM Interview)
- Take online courses (Coursera, Udemy)
- Follow PM blogs and podcasts

### 3. Network with PMs
- Attend product management meetups
- Connect with PMs on LinkedIn
- Join PM communities (Product School, Mind the Product)

### 4. Practice PM Skills
- Conduct user interviews
- Create product requirements documents
- Build wireframes and mockups
- Analyze product metrics

## The Interview Process

PM interviews typically include:

### Product Design Questions
"How would you improve Instagram Stories?"
- Understand the user and their needs
- Identify pain points and opportunities
- Propose solutions and prioritize them
- Define success metrics

### Analytical Questions
"How would you measure the success of a new feature?"
- Define key metrics (engagement, retention, revenue)
- Set up A/B tests
- Analyze data and draw insights

### Technical Questions
- System design basics
- Understanding of APIs and databases
- Trade-offs in technical decisions

### Behavioral Questions
- Leadership and influence examples
- Handling difficult situations
- Working with cross-functional teams

## My Journey

I transitioned to PM from a business analyst role. Here's what helped me:

1. **MBA Education**: Gave me business acumen and strategic thinking
2. **Cross-functional Projects**: Worked closely with engineering teams
3. **User Research**: Conducted interviews and surveys
4. **Data Analysis**: Used SQL and Excel for insights
5. **Networking**: Connected with PMs at various companies

## Common Mistakes to Avoid

- **Focusing only on features**: Think about user problems first
- **Ignoring data**: Make decisions based on evidence, not opinions
- **Poor communication**: Keep stakeholders informed and aligned
- **Not understanding users**: Spend time with actual users
- **Micromanaging**: Trust your team and focus on outcomes

## Resources to Get Started

### Books:
- "Inspired" by Marty Cagan
- "Cracking the PM Interview" by Gayle McDowell
- "The Lean Startup" by Eric Ries

### Courses:
- Google Product Management Certificate
- Product School courses
- Coursera Product Management specializations

### Communities:
- Product Hunt
- Mind the Product
- Women in Product
- Product Manager HQ

## Final Thoughts

Product Management is challenging but incredibly rewarding. You get to solve real user problems, work with talented teams, and see your ideas come to life. The path isn't always linear, but with dedication and the right approach, you can build a successful PM career.

Remember, every PM started somewhere. Focus on building the right skills, gaining relevant experience, and networking with the community. The opportunities are out there – you just need to be prepared to seize them.

Good luck on your PM journey! Feel free to reach out if you have questions or want to discuss specific opportunities.`,
    excerpt: 'Tips and strategies for aspiring product managers, including skills needed and how to break into the field.',
    tags: ['product management', 'career advice', 'microsoft', 'strategy'],
    authorId: '4',
    author: mockAlumni[1],
    publishedAt: '2024-01-18',
    likes: 32,
    likedBy: ['3'],
    comments: [],
    shares: 8,
  },
];

export const mockConnections: Connection[] = [
  {
    id: '1',
    requesterId: '3',
    receiverId: '4',
    status: 'accepted',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    requesterId: '5',
    receiverId: '3',
    status: 'accepted',
    createdAt: '2024-01-15',
  },
];

// Update alumni with blogs
mockAlumni[0].blogs = [mockBlogs[0]];
mockAlumni[1].blogs = [mockBlogs[1]];
mockAlumni[0].achievements = [mockAchievements[0], mockAchievements[1]];
mockAlumni[1].achievements = [mockAchievements[2]];