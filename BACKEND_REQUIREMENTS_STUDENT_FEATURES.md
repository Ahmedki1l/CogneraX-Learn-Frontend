# Backend Requirements: Student Features

## Overview

This document specifies the backend API endpoints required to support student features in the AI Education Platform. These endpoints enable student learning experiences including achievements, certificates, study tools, bookmarks, reviews, lesson progress tracking, and enhanced quiz functionality.

**Target Audience:** Backend Development Team  
**Priority:** P1 (High) - Core student features  
**Estimated Effort:** 3-4 weeks  
**Dependencies:** Existing User, Course, Lesson, and Quiz APIs

---

## Table of Contents

1. [Achievement System](#achievement-system)
2. [Certificate System](#certificate-system)
3. [Study Tools & Resources](#study-tools--resources)
4. [Course Bookmarks](#course-bookmarks)
5. [Course Reviews](#course-reviews)
6. [Lesson Progress Tracking](#lesson-progress-tracking)
7. [Enhanced Quiz Management](#enhanced-quiz-management)
8. [Student Analytics](#student-analytics)
9. [Database Schema Updates](#database-schema-updates)
10. [Authentication & Authorization](#authentication--authorization)
11. [Priority Matrix](#priority-matrix)

---

## Achievement System

### Overview
Gamification system to reward students for completing milestones, maintaining streaks, and demonstrating excellence.

### Endpoints

#### 1. GET `/users/me/achievements`
Get all achievements for the authenticated user.

**Authentication:** Required (Student, Instructor, Admin)

**Query Parameters:**
```typescript
{
  category?: 'completion' | 'performance' | 'streak' | 'social' | 'special';
  status?: 'earned' | 'locked' | 'in-progress';
  sortBy?: 'earnedDate' | 'points' | 'rarity';
  page?: number;
  limit?: number;
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "ach_123",
        "title": "Fast Learner",
        "description": "Complete 5 courses in 30 days",
        "category": "completion",
        "rarity": "rare",
        "points": 50,
        "icon": "zap",
        "isEarned": true,
        "earnedDate": "2024-10-15T10:30:00Z",
        "progress": 5,
        "maxProgress": 5,
        "requirements": "Complete 5 courses within 30 days"
      }
    ],
    "totalPoints": 250,
    "totalEarned": 12,
    "totalAvailable": 45,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

#### 2. POST `/users/me/achievements/:achievementId/claim`
Claim an achievement that the user has earned.

**Authentication:** Required (Student)

**Path Parameters:**
- `achievementId` (string) - Achievement ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "achievement": {
      "id": "ach_123",
      "title": "Quiz Master",
      "points": 100,
      "earnedDate": "2024-10-28T14:20:00Z"
    },
    "totalPoints": 350
  }
}
```

**Error Responses:**
- `400 Bad Request` - Achievement already claimed or requirements not met
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Achievement not found

---

#### 3. GET `/achievements`
Get all available achievements in the system.

**Authentication:** Required

**Query Parameters:**
```typescript
{
  category?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  page?: number;
  limit?: number;
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "ach_456",
        "title": "Perfect Score",
        "description": "Score 100% on any quiz",
        "category": "performance",
        "rarity": "epic",
        "points": 75,
        "icon": "trophy",
        "requirements": "Achieve 100% score on any quiz"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

---

## Certificate System

### Overview
Issue, verify, and manage certificates for course completion.

### Endpoints

#### 1. GET `/users/me/certificates`
Get all certificates earned by the authenticated user.

**Authentication:** Required (Student, Instructor, Admin)

**Query Parameters:**
```typescript
{
  status?: 'active' | 'expired' | 'revoked';
  courseId?: string;
  sortBy?: 'issueDate' | 'completionDate' | 'grade';
  page?: number;
  limit?: number;
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "id": "cert_789",
        "certificateNumber": "CERT-2024-001234",
        "title": "React Fundamentals Certification",
        "description": "Awarded for completing React Fundamentals course",
        "course": {
          "id": "course_123",
          "title": "React Fundamentals",
          "field": "Web Development"
        },
        "instructor": {
          "id": "user_456",
          "name": "Dr. Sarah Chen"
        },
        "student": {
          "id": "user_789",
          "name": "John Doe"
        },
        "completionDate": "2024-10-20T15:30:00Z",
        "issueDate": "2024-10-21T09:00:00Z",
        "expiryDate": null,
        "creditsEarned": 3.5,
        "grade": "A",
        "finalScore": 95,
        "skills": ["React", "Hooks", "Components"],
        "verificationUrl": "https://platform.edu/verify/CERT-2024-001234",
        "isVerified": true,
        "status": "active",
        "template": "premium"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

#### 2. GET `/certificates/:certificateId/download`
Download a certificate as PDF.

**Authentication:** Required (Student, Instructor, Admin)

**Path Parameters:**
- `certificateId` (string) - Certificate ID

**Query Parameters:**
```typescript
{
  format?: 'pdf' | 'png' | 'svg';
  template?: 'standard' | 'premium' | 'advanced';
}
```

**Response (200 OK):**
- Content-Type: `application/pdf` or `image/png` or `image/svg+xml`
- Binary file data

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized to download this certificate
- `404 Not Found` - Certificate not found

---

#### 3. POST `/certificates/verify`
Verify a certificate by certificate number.

**Authentication:** Optional (Public endpoint)

**Request Body:**
```json
{
  "certificateNumber": "CERT-2024-001234"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "certificate": {
      "certificateNumber": "CERT-2024-001234",
      "title": "React Fundamentals Certification",
      "studentName": "John Doe",
      "courseName": "React Fundamentals",
      "issueDate": "2024-10-21T09:00:00Z",
      "status": "active"
    }
  }
}
```

**Error Responses:**
- `404 Not Found` - Certificate not found or invalid

---

#### 4. POST `/certificates/share`
Generate a shareable link for a certificate.

**Authentication:** Required (Student, Instructor, Admin)

**Request Body:**
```json
{
  "certificateId": "cert_789",
  "expiresIn": 86400
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "shareUrl": "https://platform.edu/certificates/share/abc123token",
    "expiresAt": "2024-10-29T14:20:00Z"
  }
}
```

---

## Study Tools & Resources

### Overview
Tools to help students organize notes, flashcards, and study materials.

### Endpoints

#### 1. GET `/users/me/study-resources`
Get study resources and materials for the authenticated user.

**Authentication:** Required (Student)

**Query Parameters:**
```typescript
{
  courseId?: string;
  type?: 'note' | 'flashcard' | 'summary' | 'bookmark';
  page?: number;
  limit?: number;
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "id": "res_123",
        "type": "note",
        "title": "React Hooks Summary",
        "content": "useState manages state...",
        "course": {
          "id": "course_123",
          "title": "React Fundamentals"
        },
        "lesson": {
          "id": "lesson_456",
          "title": "Introduction to Hooks"
        },
        "createdAt": "2024-10-20T10:30:00Z",
        "updatedAt": "2024-10-21T15:45:00Z",
        "tags": ["react", "hooks", "state"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15
    }
  }
}
```

---

#### 2. POST `/users/me/notes`
Save a new study note.

**Authentication:** Required (Student)

**Request Body:**
```json
{
  "title": "React Hooks Summary",
  "content": "useState manages state in functional components...",
  "courseId": "course_123",
  "lessonId": "lesson_456",
  "tags": ["react", "hooks", "state"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note_789",
      "title": "React Hooks Summary",
      "content": "useState manages state...",
      "courseId": "course_123",
      "lessonId": "lesson_456",
      "tags": ["react", "hooks", "state"],
      "createdAt": "2024-10-28T14:20:00Z",
      "updatedAt": "2024-10-28T14:20:00Z"
    }
  }
}
```

---

#### 3. GET `/users/me/notes`
Get all saved notes for the authenticated user.

**Authentication:** Required (Student)

**Query Parameters:**
```typescript
{
  courseId?: string;
  lessonId?: string;
  search?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  page?: number;
  limit?: number;
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "note_789",
        "title": "React Hooks Summary",
        "content": "useState manages state...",
        "course": {
          "id": "course_123",
          "title": "React Fundamentals"
        },
        "lesson": {
          "id": "lesson_456",
          "title": "Introduction to Hooks"
        },
        "tags": ["react", "hooks", "state"],
        "createdAt": "2024-10-28T14:20:00Z",
        "updatedAt": "2024-10-28T14:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15
    }
  }
}
```

---

#### 4. PUT `/users/me/notes/:noteId`
Update an existing note.

**Authentication:** Required (Student)

**Path Parameters:**
- `noteId` (string) - Note ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "tags": ["react", "hooks"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note_789",
      "title": "Updated Title",
      "content": "Updated content...",
      "tags": ["react", "hooks"],
      "updatedAt": "2024-10-28T15:30:00Z"
    }
  }
}
```

---

#### 5. DELETE `/users/me/notes/:noteId`
Delete a note.

**Authentication:** Required (Student)

**Path Parameters:**
- `noteId` (string) - Note ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

---

## Course Bookmarks

### Overview
Allow students to bookmark courses for quick access.

### Endpoints

#### 1. POST `/courses/:courseId/bookmark`
Bookmark a course.

**Authentication:** Required (Student)

**Path Parameters:**
- `courseId` (string) - Course ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Course bookmarked successfully",
  "data": {
    "bookmarkedAt": "2024-10-28T14:20:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Course already bookmarked
- `404 Not Found` - Course not found

---

#### 2. DELETE `/courses/:courseId/bookmark`
Remove a course bookmark.

**Authentication:** Required (Student)

**Path Parameters:**
- `courseId` (string) - Course ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bookmark removed successfully"
}
```

---

#### 3. GET `/users/me/bookmarked-courses`
Get all bookmarked courses for the authenticated user.

**Authentication:** Required (Student)

**Query Parameters:**
```typescript
{
  field?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  page?: number;
  limit?: number;
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course_123",
        "title": "React Fundamentals",
        "instructor": {
          "id": "user_456",
          "name": "Dr. Sarah Chen"
        },
        "field": "Web Development",
        "level": "beginner",
        "thumbnail": "https://cdn.example.com/course-123.jpg",
        "rating": 4.8,
        "studentsCount": 1250,
        "bookmarkedAt": "2024-10-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8
    }
  }
}
```

---

## Course Reviews

### Overview
Allow students to rate and review courses.

### Endpoints

#### 1. POST `/courses/:courseId/reviews`
Add a review for a course.

**Authentication:** Required (Student - must be enrolled)

**Path Parameters:**
- `courseId` (string) - Course ID

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent course! Learned a lot about React.",
  "wouldRecommend": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "review": {
      "id": "review_123",
      "courseId": "course_123",
      "userId": "user_789",
      "rating": 5,
      "comment": "Excellent course! Learned a lot about React.",
      "wouldRecommend": true,
      "createdAt": "2024-10-28T14:20:00Z",
      "updatedAt": "2024-10-28T14:20:00Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid rating (must be 1-5) or user already reviewed
- `403 Forbidden` - User not enrolled in course
- `404 Not Found` - Course not found

---

#### 2. GET `/courses/:courseId/reviews`
Get all reviews for a course.

**Authentication:** Optional

**Path Parameters:**
- `courseId` (string) - Course ID

**Query Parameters:**
```typescript
{
  rating?: number;
  sortBy?: 'date' | 'rating' | 'helpful';
  page?: number;
  limit?: number;
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_123",
        "user": {
          "id": "user_789",
          "name": "John Doe",
          "avatar": "https://cdn.example.com/avatar-789.jpg"
        },
        "rating": 5,
        "comment": "Excellent course!",
        "wouldRecommend": true,
        "helpfulCount": 12,
        "createdAt": "2024-10-28T14:20:00Z"
      }
    ],
    "statistics": {
      "averageRating": 4.7,
      "totalReviews": 124,
      "ratingDistribution": {
        "5": 85,
        "4": 30,
        "3": 7,
        "2": 1,
        "1": 1
      }
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 124
    }
  }
}
```

---

#### 3. PUT `/courses/:courseId/reviews/:reviewId`
Update an existing review.

**Authentication:** Required (Student - must be review owner)

**Path Parameters:**
- `courseId` (string) - Course ID
- `reviewId` (string) - Review ID

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated review comment",
  "wouldRecommend": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "review": {
      "id": "review_123",
      "rating": 4,
      "comment": "Updated review comment",
      "updatedAt": "2024-10-28T15:30:00Z"
    }
  }
}
```

---

## Lesson Progress Tracking

### Overview
Track student progress through individual lessons.

### Endpoints

#### 1. PUT `/lessons/:lessonId/progress`
Update progress for a specific lesson.

**Authentication:** Required (Student)

**Path Parameters:**
- `lessonId` (string) - Lesson ID

**Request Body:**
```json
{
  "progress": 75,
  "completed": false,
  "timeSpent": 1800,
  "lastPosition": {
    "type": "video",
    "timestamp": 450
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "lessonProgress": {
      "lessonId": "lesson_456",
      "userId": "user_789",
      "progress": 75,
      "completed": false,
      "timeSpent": 1800,
      "lastPosition": {
        "type": "video",
        "timestamp": 450
      },
      "updatedAt": "2024-10-28T14:20:00Z"
    },
    "courseProgress": {
      "courseId": "course_123",
      "overallProgress": 62,
      "completedLessons": 8,
      "totalLessons": 12
    }
  }
}
```

---

#### 2. GET `/lessons/:lessonId/progress`
Get progress for a specific lesson.

**Authentication:** Required (Student)

**Path Parameters:**
- `lessonId` (string) - Lesson ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "lessonProgress": {
      "lessonId": "lesson_456",
      "userId": "user_789",
      "progress": 75,
      "completed": false,
      "timeSpent": 1800,
      "lastPosition": {
        "type": "video",
        "timestamp": 450
      },
      "startedAt": "2024-10-25T10:00:00Z",
      "lastAccessedAt": "2024-10-28T14:20:00Z"
    }
  }
}
```

---

#### 3. POST `/lessons/:lessonId/complete`
Mark a lesson as complete.

**Authentication:** Required (Student)

**Path Parameters:**
- `lessonId` (string) - Lesson ID

**Request Body:**
```json
{
  "timeSpent": 2400,
  "score": 95
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "lessonProgress": {
      "lessonId": "lesson_456",
      "completed": true,
      "completedAt": "2024-10-28T14:20:00Z",
      "timeSpent": 2400,
      "score": 95
    },
    "achievements": [
      {
        "id": "ach_lesson_complete",
        "title": "Lesson Master",
        "points": 10
      }
    ],
    "nextLesson": {
      "id": "lesson_457",
      "title": "Advanced React Patterns",
      "order": 9
    }
  }
}
```

---

## Enhanced Quiz Management

### Overview
Enhanced quiz features including attempt tracking and progress saving.

### Endpoints

#### 1. POST `/quizzes/:quizId/attempts`
Start a new quiz attempt.

**Authentication:** Required (Student)

**Path Parameters:**
- `quizId` (string) - Quiz ID

**Request Body:**
```json
{
  "mode": "practice"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": "attempt_123",
      "quizId": "quiz_456",
      "userId": "user_789",
      "attemptNumber": 1,
      "status": "in_progress",
      "startedAt": "2024-10-28T14:20:00Z",
      "timeLimit": 3600,
      "expiresAt": "2024-10-28T15:20:00Z",
      "questions": [
        {
          "id": "q_1",
          "type": "mcq",
          "question": "What is React?",
          "options": ["Library", "Framework", "Language", "Tool"],
          "points": 5,
          "order": 1
        }
      ],
      "antiCheating": {
        "fullscreenRequired": true,
        "preventTabSwitch": true,
        "shuffleQuestions": true,
        "shuffleOptions": true
      }
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Maximum attempts reached
- `403 Forbidden` - Not enrolled in course
- `404 Not Found` - Quiz not found

---

#### 2. PUT `/quizzes/:quizId/attempts/:attemptId`
Save progress during a quiz attempt (auto-save).

**Authentication:** Required (Student)

**Path Parameters:**
- `quizId` (string) - Quiz ID
- `attemptId` (string) - Attempt ID

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "q_1",
      "answer": "Library",
      "timeSpent": 30
    },
    {
      "questionId": "q_2",
      "answer": "useState manages state",
      "timeSpent": 120
    }
  ],
  "currentQuestionIndex": 2
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Progress saved",
  "data": {
    "attemptId": "attempt_123",
    "savedAt": "2024-10-28T14:25:00Z",
    "answeredQuestions": 2,
    "totalQuestions": 10
  }
}
```

---

## Student Analytics

### Overview
Detailed analytics for student learning patterns and performance.

### Endpoints

#### 1. GET `/analytics/student/progress`
Get detailed progress analytics.

**Authentication:** Required (Student)

**Query Parameters:**
```typescript
{
  timeRange?: '7d' | '30d' | '90d' | 'all';
  courseId?: string;
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCourses": 5,
      "activeCourses": 3,
      "completedCourses": 2,
      "averageProgress": 68,
      "totalLessonsCompleted": 45,
      "totalQuizzesTaken": 28
    },
    "progressByField": [
      {
        "field": "Web Development",
        "coursesEnrolled": 3,
        "averageProgress": 75,
        "completedCourses": 1
      }
    ],
    "recentActivity": [
      {
        "type": "lesson_completed",
        "courseTitle": "React Fundamentals",
        "lessonTitle": "Introduction to Hooks",
        "timestamp": "2024-10-28T10:30:00Z"
      }
    ],
    "milestones": [
      {
        "type": "course_completion",
        "title": "Completed first course",
        "achievedAt": "2024-10-15T14:00:00Z"
      }
    ]
  }
}
```

---

#### 2. GET `/analytics/student/time-tracking`
Get study time analytics.

**Authentication:** Required (Student)

**Query Parameters:**
```typescript
{
  timeRange?: '7d' | '30d' | '90d' | 'all';
  groupBy?: 'day' | 'week' | 'month';
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalStudyTime": 12540,
    "averageSessionDuration": 45,
    "longestStreak": 15,
    "currentStreak": 7,
    "studyPattern": [
      {
        "date": "2024-10-28",
        "minutes": 120,
        "sessions": 3
      }
    ],
    "timeByField": [
      {
        "field": "Web Development",
        "minutes": 8400,
        "percentage": 67
      }
    ],
    "peakStudyHours": [14, 15, 16, 20, 21]
  }
}
```

---

## Database Schema Updates

### New Collections/Tables

#### 1. Achievements Collection
```typescript
{
  id: string;
  title: string;
  description: string;
  category: 'completion' | 'performance' | 'streak' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  icon: string;
  requirements: {
    type: string;
    threshold: number;
    timeframe?: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. User Achievements (Join Table)
```typescript
{
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  maxProgress: number;
  isEarned: boolean;
  earnedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3. Certificates Collection
```typescript
{
  id: string;
  certificateNumber: string;
  userId: string;
  courseId: string;
  instructorId: string;
  title: string;
  description: string;
  completionDate: Date;
  issueDate: Date;
  expiryDate?: Date;
  creditsEarned: number;
  grade: string;
  finalScore: number;
  skills: string[];
  verificationUrl: string;
  isVerified: boolean;
  status: 'active' | 'expired' | 'revoked';
  template: 'standard' | 'premium' | 'advanced';
  metadata: object;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 4. Study Notes Collection
```typescript
{
  id: string;
  userId: string;
  courseId: string;
  lessonId?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### 5. Course Bookmarks (Join Table)
```typescript
{
  id: string;
  userId: string;
  courseId: string;
  bookmarkedAt: Date;
}
```

#### 6. Course Reviews Collection
```typescript
{
  id: string;
  userId: string;
  courseId: string;
  rating: number; // 1-5
  comment: string;
  wouldRecommend: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 7. Lesson Progress Collection
```typescript
{
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  progress: number; // 0-100
  completed: boolean;
  completedAt?: Date;
  timeSpent: number; // seconds
  lastPosition?: {
    type: string;
    timestamp: number;
  };
  score?: number;
  startedAt: Date;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 8. Quiz Attempts Collection
```typescript
{
  id: string;
  userId: string;
  quizId: string;
  courseId: string;
  attemptNumber: number;
  status: 'in_progress' | 'submitted' | 'graded' | 'abandoned';
  startedAt: Date;
  submittedAt?: Date;
  completedAt?: Date;
  timeLimit: number;
  expiresAt: Date;
  answers: {
    questionId: string;
    answer: any;
    timeSpent: number;
    isCorrect?: boolean;
  }[];
  score?: number;
  totalPoints: number;
  percentage?: number;
  feedback?: string;
  antiCheating: {
    tabSwitchCount: number;
    fullscreenExits: number;
    suspiciousActivity: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Schema Updates to Existing Collections

#### Users Collection - Add Fields
```typescript
{
  // ... existing fields
  achievements: {
    totalPoints: number;
    earnedCount: number;
  };
  studyStats: {
    totalStudyTime: number; // seconds
    longestStreak: number;
    currentStreak: number;
    lastStudyDate: Date;
  };
  preferences: {
    studyReminders: boolean;
    achievementNotifications: boolean;
    emailDigest: 'daily' | 'weekly' | 'none';
  };
}
```

#### Courses Collection - Add Fields
```typescript
{
  // ... existing fields
  statistics: {
    averageRating: number;
    totalReviews: number;
    totalBookmarks: number;
    completionRate: number;
  };
}
```

---

## Authentication & Authorization

### Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header, except:
- `POST /certificates/verify` - Public endpoint
- `GET /courses/:courseId/reviews` - Public endpoint (optional auth for personalized data)

### Authorization Rules

#### Student Role:
- Can access all `/users/me/*` endpoints for their own data
- Can bookmark/unbookmark courses
- Can add/edit/delete their own reviews
- Can track progress on enrolled courses only
- Can start quiz attempts for enrolled courses only
- Can view their own achievements and certificates

#### Instructor Role:
- All student permissions
- Can view student progress for courses they teach
- Cannot modify student achievements or certificates

#### Admin Role:
- Full access to all endpoints
- Can create/modify/delete achievements
- Can issue/revoke certificates
- Can view all student data

### Permission Checks:
```typescript
// Enrollment check for course-specific actions
if (action requires course enrollment) {
  const isEnrolled = await checkEnrollment(userId, courseId);
  if (!isEnrolled) throw new ForbiddenError('Must be enrolled');
}

// Ownership check for resource modification
if (action is edit/delete) {
  const isOwner = resource.userId === userId;
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ForbiddenError();
}
```

---

## Priority Matrix

### P0 - Critical (Must Have)
1. Lesson Progress Tracking (`PUT /lessons/:lessonId/progress`, `GET /lessons/:lessonId/progress`)
2. Quiz Attempts (`POST /quizzes/:quizId/attempts`, `PUT /quizzes/:quizId/attempts/:attemptId`)
3. Course Reviews (`POST /courses/:courseId/reviews`, `GET /courses/:courseId/reviews`)

### P1 - High Priority (Should Have)
4. Course Bookmarks (All endpoints)
5. Student Analytics (`GET /analytics/student/progress`, `GET /analytics/student/time-tracking`)
6. Study Notes (`POST /users/me/notes`, `GET /users/me/notes`, `PUT /users/me/notes/:noteId`)

### P2 - Medium Priority (Nice to Have)
7. Certificates (All endpoints except verify)
8. Certificate Verification (`POST /certificates/verify`)
9. Achievement System (All endpoints)

### P3 - Low Priority (Future Enhancement)
10. Advanced Study Tools (flashcards, summaries)
11. Certificate Sharing (`POST /certificates/share`)
12. Review helpful votes

---

## Integration Points

### Existing APIs to Update

1. **Course Enrollment** - When student enrolls, initialize lesson progress records
2. **Lesson Completion** - Trigger achievement checks, update course progress
3. **Quiz Submission** - Check for achievements (perfect score, etc.)
4. **Course Completion** - Generate certificate, award completion achievement
5. **User Dashboard** - Aggregate data from new collections

### Event Triggers

```typescript
// Achievement trigger examples
onLessonComplete(userId, lessonId) {
  checkAchievements(userId, 'lesson_completion');
}

onQuizPerfectScore(userId, quizId) {
  checkAchievements(userId, 'perfect_score');
}

onCourseComplete(userId, courseId) {
  generateCertificate(userId, courseId);
  checkAchievements(userId, 'course_completion');
}

onStreakUpdate(userId, days) {
  checkAchievements(userId, 'study_streak', { days });
}
```

---

## Implementation Notes

### Performance Considerations
1. Index `userId` on all collections for fast user data retrieval
2. Index `courseId` + `userId` for enrollment checks
3. Cache achievement criteria to avoid repeated database queries
4. Implement pagination for all list endpoints (default 20, max 100)

### Security Considerations
1. Rate limit review submission (1 per course per user)
2. Validate quiz attempt expiry before accepting answers
3. Sanitize user-generated content (notes, reviews)
4. Verify certificate authenticity with cryptographic signatures

### Error Handling
Use consistent error response format:
```json
{
  "success": false,
  "error": {
    "code": "ENROLLMENT_REQUIRED",
    "message": "You must be enrolled in this course",
    "statusCode": 403
  }
}
```

### Testing Requirements
- Unit tests for all endpoints
- Integration tests for achievement triggers
- Load tests for analytics endpoints
- E2E tests for quiz attempt flow

---

## Timeline & Milestones

### Week 1-2: P0 Features
- Lesson progress tracking
- Enhanced quiz attempts
- Course reviews

### Week 3: P1 Features
- Course bookmarks
- Basic student analytics
- Study notes CRUD

### Week 4: P2 Features
- Certificate system
- Achievement system
- Testing & bug fixes

---

## Contact & Support

For questions or clarifications about these requirements:
- Frontend Team Lead: [Contact Info]
- Backend Team Lead: [Contact Info]
- Product Owner: [Contact Info]

**Last Updated:** October 28, 2024  
**Version:** 1.0.0

