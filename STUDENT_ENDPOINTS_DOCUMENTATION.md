# Student Endpoints Documentation

Complete API documentation for all student-related endpoints in the education platform.

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents
1. [Student Management](#student-management)
2. [Course Enrollment](#course-enrollment)
3. [Lesson Progress](#lesson-progress)
4. [Exams & Assignments](#exams--assignments)
5. [Student Analytics](#student-analytics)
6. [Shopping Cart & Payments](#shopping-cart--payments)
7. [Notifications](#notifications)

---

## Student Management

### Get All Students
**Endpoint:** `GET /students`  
**Access:** Admin/Instructor with `view_analytics` permission

**Query Parameters:**
- `course` (string, optional) - Filter by course ID or "all"
- `search` (string, optional) - Search by name or email
- `status` (string, optional) - Filter by status (active, inactive, suspended) - default: "active"
- `progressMin` (number, optional) - Minimum progress percentage
- `progressMax` (number, optional) - Maximum progress percentage
- `page` (number, optional) - Page number - default: 1
- `limit` (number, optional) - Items per page - default: 10
- `sortBy` (string, optional) - Sort field - default: "name"
- `sortOrder` (string, optional) - Sort order (asc, desc) - default: "asc"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "student_id",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "avatar_url",
      "organization": {
        "_id": "org_id",
        "name": "Organization Name"
      },
      "status": "active",
      "enrolledCourses": [
        {
          "courseId": {
            "_id": "course_id",
            "title": "Course Title",
            "thumbnail": "thumbnail_url",
            "instructor": {
              "name": "Instructor Name",
              "email": "instructor@example.com"
            }
          },
          "progress": 75,
          "status": "active",
          "enrolledAt": "2024-01-15T10:00:00.000Z"
        }
      ],
      "metrics": {
        "averageProgress": 75,
        "completedCourses": 2,
        "enrolledCourses": 5,
        "recentActivity": 15
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "total": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### Get Student Details
**Endpoint:** `GET /students/:id`  
**Access:** Admin/Instructor with `view_analytics` permission

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "student_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "avatar_url",
    "phone": "+1234567890",
    "organization": {
      "_id": "org_id",
      "name": "Organization Name"
    },
    "enrolledCourses": [
      {
        "courseId": {
          "_id": "course_id",
          "title": "Course Title",
          "thumbnail": "thumbnail_url",
          "instructor": "Instructor Name"
        },
        "progress": 75,
        "status": "active",
        "completedLessons": ["lesson_id_1", "lesson_id_2"],
        "enrolledAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "statistics": {
      "totalCourses": 5,
      "completedCourses": 2,
      "inProgressCourses": 3,
      "averageProgress": 65,
      "totalQuizzesTaken": 15,
      "averageQuizScore": 85,
      "assignmentsCompleted": 10,
      "totalAssignments": 12,
      "learningStreak": 7,
      "achievements": 3
    },
    "recentActivity": [...],
    "upcomingDeadlines": [...],
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get Student Progress
**Endpoint:** `GET /students/:id/progress`  
**Access:** Admin/Instructor with `view_analytics` permission

**Query Parameters:**
- `courseId` (string, optional) - Filter by specific course ID or "all"

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": "student_id",
    "overallProgress": 68,
    "courses": [
      {
        "courseId": "course_id",
        "title": "Course Title",
        "progress": 75,
        "completedLessons": 15,
        "totalLessons": 20,
        "quizzesTaken": 5,
        "totalQuizzes": 6,
        "averageQuizScore": 88,
        "assignmentsCompleted": 4,
        "totalAssignments": 5,
        "timeSpent": 3600,
        "lastAccessed": "2024-01-20T15:30:00.000Z",
        "status": "active"
      }
    ],
    "totalTimeSpent": 18000,
    "totalLessonsCompleted": 45,
    "totalQuizzesTaken": 15,
    "totalAssignmentsCompleted": 10
  }
}
```

---

### Get All Students Progress Overview
**Endpoint:** `GET /students/all/progress`  
**Access:** Admin/Instructor with `view_analytics` permission

**Query Parameters:**
- `courseId` (string, optional) - Filter by specific course ID or "all"
- `timeRange` (string, optional) - Time range for analytics (7d, 30d, 90d, 1y) - default: 30d
- `page` (number, optional) - Page number - default: 1
- `limit` (number, optional) - Items per page - default: 10

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "_id": "student_id",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "avatar_url",
        "organization": {...},
        "status": "active",
        "enrolledCourses": [...],
        "progressStats": {
          "totalCourses": 5,
          "completedCourses": 2,
          "overallProgress": 68,
          "coursesInProgress": 3
        },
        "recentActivity": [...]
      }
    ],
    "summaryStats": {
      "totalStudents": 50,
      "totalEnrollments": 250,
      "averageProgress": 65,
      "totalCompletedCourses": 100,
      "completionRate": 40
    },
    "pagination": {...}
  }
}
```

---

### Invite Students
**Endpoint:** `POST /students`  
**Access:** Admin with `manage_users` permission

**Request Body:**
```json
{
  "emails": ["student1@example.com", "student2@example.com"],
  "role": "student",
  "message": "Welcome message",
  "description": "Invitation description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invitation": {
      "id": "invitation_id",
      "token": "unique_token",
      "role": "student",
      "invitationUrl": "http://localhost:3000/invite/unique_token",
      "expiresAt": "2024-02-01T00:00:00.000Z"
    }
  }
}
```

---

### Export Students Data
**Endpoint:** `GET /students/export`  
**Access:** Admin/Instructor with `export_data` permission

**Query Parameters:**
- `course` (string, optional) - Filter by course ID
- `search` (string, optional) - Search by name or email
- `status` (string, optional) - Filter by status
- `format` (string, optional) - Export format (csv, json) - default: "csv"

**Response:** File download (CSV or JSON)

---

## Course Enrollment

### Get All Courses
**Endpoint:** `GET /courses`  
**Access:** Public

**Query Parameters:**
- `search` (string, optional) - Search by title or description
- `field` (string, optional) - Filter by field ID
- `category` (string, optional) - Filter by category
- `level` (string, optional) - Filter by level (beginner, intermediate, advanced)
- `minPrice` (number, optional) - Minimum price
- `maxPrice` (number, optional) - Maximum price
- `instructor` (string, optional) - Filter by instructor ID
- `status` (string, optional) - Filter by status (published, draft, archived)
- `page` (number, optional) - Page number - default: 1
- `limit` (number, optional) - Items per page - default: 10
- `sort` (string, optional) - Sort field - default: "-createdAt"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "course_id",
      "title": "Course Title",
      "shortDescription": "Brief description",
      "description": "Full description",
      "thumbnail": "thumbnail_url",
      "price": 99.99,
      "originalPrice": 149.99,
      "isFree": false,
      "level": "intermediate",
      "language": "en",
      "field": "field_name",
      "category": "category_name",
      "instructor": {
        "_id": "instructor_id",
        "name": "Instructor Name",
        "avatar": "avatar_url"
      },
      "lessonsCount": 25,
      "studentsCount": 150,
      "averageRating": 4.5,
      "totalRatings": 50,
      "status": "published",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

### Get Course Details
**Endpoint:** `GET /courses/:id`  
**Access:** Public

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "course_id",
    "title": "Course Title",
    "description": "Full description",
    "thumbnail": "thumbnail_url",
    "previewVideo": "video_url",
    "price": 99.99,
    "isFree": false,
    "level": "intermediate",
    "language": "en",
    "instructor": {
      "_id": "instructor_id",
      "name": "Instructor Name",
      "avatar": "avatar_url",
      "email": "instructor@example.com",
      "bio": "Instructor bio",
      "rating": 4.8
    },
    "organization": {
      "_id": "org_id",
      "name": "Organization Name",
      "logo": "logo_url"
    },
    "lessons": [
      {
        "lessonId": {
          "_id": "lesson_id",
          "title": "Lesson Title",
          "contentType": "video",
          "estimatedTime": 30
        },
        "order": 1,
        "isPreview": true
      }
    ],
    "lessonsCount": 25,
    "studentsCount": 150,
    "averageRating": 4.5,
    "totalRatings": 50,
    "reviews": [...],
    "requirements": ["Requirement 1", "Requirement 2"],
    "learningObjectives": ["Objective 1", "Objective 2"],
    "status": "published",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Enroll in Course
**Endpoint:** `POST /courses/:id/enroll`  
**Access:** Student

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "course_id",
    "enrolledAt": "2024-01-20T10:00:00.000Z",
    "progress": 0,
    "status": "active"
  },
  "message": "Successfully enrolled in course"
}
```

---

### Unenroll from Course
**Endpoint:** `DELETE /courses/:id/enroll`  
**Access:** Student

**Response:**
```json
{
  "success": true,
  "message": "Successfully unenrolled from course"
}
```

---

### Get Enrolled Courses
**Endpoint:** `GET /courses/enrolled`  
**Access:** Student

**Query Parameters:**
- `status` (string, optional) - Filter by status (active, completed, dropped)
- `page` (number, optional) - Page number - default: 1
- `limit` (number, optional) - Items per page - default: 10

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "course_id",
      "title": "Course Title",
      "thumbnail": "thumbnail_url",
      "instructor": {
        "name": "Instructor Name",
        "avatar": "avatar_url"
      },
      "progress": 75,
      "status": "active",
      "enrolledAt": "2024-01-15T10:00:00.000Z",
      "lastAccessedAt": "2024-01-20T15:30:00.000Z",
      "completedLessons": 15,
      "totalLessons": 20
    }
  ],
  "pagination": {...}
}
```

---

### Get Enrolled Courses by Fields
**Endpoint:** `GET /courses/enrolled/fields`  
**Access:** Student

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "field": "Computer Science",
      "courses": [
        {
          "_id": "course_id",
          "title": "Course Title",
          "thumbnail": "thumbnail_url",
          "progress": 75,
          "status": "active"
        }
      ]
    }
  ]
}
```

---

### Add Course Review
**Endpoint:** `POST /courses/:id/reviews`  
**Access:** Student/Admin

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent course!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "review": {
      "studentId": "student_id",
      "rating": 5,
      "comment": "Excellent course!",
      "createdAt": "2024-01-20T10:00:00.000Z"
    },
    "averageRating": 4.6,
    "totalRatings": 51
  }
}
```

---

## Lesson Progress

### Get Lessons for Course
**Endpoint:** `GET /lessons?courseId=:courseId`  
**Access:** Student (must be enrolled)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "lesson_id",
      "title": "Lesson Title",
      "description": "Lesson description",
      "contentType": "video",
      "videoUrl": "video_url",
      "duration": 1800,
      "order": 1,
      "isCompleted": false,
      "resources": [
        {
          "title": "Resource Title",
          "type": "pdf",
          "url": "resource_url"
        }
      ]
    }
  ]
}
```

---

### Get Lesson Details
**Endpoint:** `GET /lessons/:id`  
**Access:** Student (must be enrolled in course)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "lesson_id",
    "title": "Lesson Title",
    "description": "Detailed description",
    "contentType": "video",
    "videoUrl": "video_url",
    "duration": 1800,
    "order": 1,
    "resources": [...],
    "quizzes": [...],
    "isCompleted": false,
    "courseId": "course_id",
    "estimatedTime": 30
  }
}
```

---

### Mark Lesson as Complete
**Endpoint:** `POST /lessons/:id/complete`  
**Access:** Student (must be enrolled)

**Response:**
```json
{
  "success": true,
  "data": {
    "lessonId": "lesson_id",
    "completed": true,
    "completedAt": "2024-01-20T16:00:00.000Z",
    "courseProgress": 80
  },
  "message": "Lesson marked as complete"
}
```

---

### Get Lesson Resources
**Endpoint:** `GET /lessons/:id/resources`  
**Access:** Student (must be enrolled)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "resource_id",
      "title": "Resource Title",
      "type": "pdf",
      "url": "resource_url",
      "size": 1024000,
      "uploadedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## Exams & Assignments

### Get Scheduled Exams
**Endpoint:** `GET /exams/schedule`  
**Access:** Student

**Query Parameters:**
- `fieldId` (string, optional) - Filter by field ID
- `courseId` (string, optional) - Filter by course ID
- `status` (string, optional) - 'scheduled' | 'active'
- `fromDate` (string, optional) - Start date filter (ISO format)
- `toDate` (string, optional) - End date filter (ISO format)
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "exam_id",
        "title": "Midterm Examination",
        "description": "Course midterm exam covering chapters 1-5",
        "courseId": "course_id",
        "courseTitle": "Introduction to Computer Science",
        "scheduledDate": "2024-02-01T10:00:00.000Z",
        "scheduledEndDate": "2024-02-01T12:00:00.000Z",
        "duration": 120,
        "totalPoints": 100,
        "passingScore": 60,
        "questionCount": 50,
        "status": "scheduled",
        "instructions": "Read all questions carefully before answering."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

### Start Exam Session
**Endpoint:** `POST /exams/:examId/start`  
**Access:** Student (must be enrolled in course)

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session_id",
      "examId": "exam_id",
      "studentId": "student_id",
      "startedAt": "2024-02-01T10:00:00.000Z",
      "expiresAt": "2024-02-01T12:00:00.000Z",
      "timeRemaining": 7200
    },
    "exam": {
      "id": "exam_id",
      "title": "Midterm Examination",
      "description": "Course midterm exam",
      "duration": 120,
      "totalPoints": 100,
      "sections": [
        {
          "id": "section_id",
          "title": "Multiple Choice",
          "questions": [
            {
              "id": "question_id",
              "question": "What is the time complexity of binary search?",
              "type": "multiple-choice",
              "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
              "points": 4,
              "difficulty": "medium"
            }
          ],
          "points": 40
        }
      ],
      "shuffleQuestions": true,
      "shuffleAnswers": true,
      "instructions": "Read all questions carefully."
    }
  }
}
```

**Note:** Correct answers are NOT included when starting an exam.

---

### Save Exam Progress
**Endpoint:** `PATCH /exams/:examId/sessions/:sessionId/progress`  
**Access:** Student (owner of session)

**Request Body:**
```json
{
  "answers": {
    "question_id_1": 1,
    "question_id_2": "Essay answer text...",
    "question_id_3": 0
  },
  "currentQuestionIndex": 15,
  "timeRemaining": 3600
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_id",
    "lastSavedAt": "2024-02-01T10:30:00.000Z",
    "answersCount": 15
  },
  "message": "Progress saved successfully"
}
```

---

### Submit Exam
**Endpoint:** `POST /exams/:examId/sessions/:sessionId/submit`  
**Access:** Student (owner of session)

**Request Body:**
```json
{
  "answers": {
    "question_id_1": 1,
    "question_id_2": "Essay answer text...",
    "question_id_3": 0
  },
  "submittedAt": "2024-02-01T11:45:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "submission_id",
    "examId": "exam_id",
    "submittedAt": "2024-02-01T11:45:00.000Z",
    "status": "submitted",
    "autoGradedScore": 32,
    "pendingGrading": 2,
    "message": "Exam submitted successfully. Essay questions are pending grading."
  }
}
```

---

### Get Student Exam Grades
**Endpoint:** `GET /exams/grades`  
**Access:** Student

**Query Parameters:**
- `examId` (string, optional) - Filter by specific exam
- `courseId` (string, optional) - Filter by course
- `status` (string, optional) - 'graded' | 'pending'
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "grades": [
      {
        "id": "grade_id",
        "submissionId": "submission_id",
        "examId": "exam_id",
        "examTitle": "Midterm Examination",
        "courseTitle": "Introduction to Computer Science",
        "totalScore": 85,
        "maxScore": 100,
        "percentage": 85,
        "letterGrade": "B+",
        "passed": true,
        "gradingMethod": "hybrid",
        "gradedAt": "2024-02-02T14:00:00.000Z",
        "questionGrades": [
          {
            "questionId": "question_id",
            "pointsAwarded": 4,
            "maxPoints": 4,
            "feedback": "Correct!"
          }
        ],
        "overallFeedback": "Good performance overall. Focus on improving essay structure."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1
    },
    "summary": {
      "totalExams": 3,
      "averageScore": 82,
      "passedExams": 3,
      "pendingGrades": 0
    }
  }
}
```

---

### Get Single Exam Grade Details
**Endpoint:** `GET /exams/:examId/grades/:studentId`  
**Access:** Student (own grades only)

**Response:**
```json
{
  "success": true,
  "data": {
    "grade": {
      "id": "grade_id",
      "submissionId": "submission_id",
      "examId": "exam_id",
      "totalScore": 85,
      "maxScore": 100,
      "percentage": 85,
      "letterGrade": "B+",
      "passed": true,
      "gradingMethod": "hybrid",
      "gradedAt": "2024-02-02T14:00:00.000Z",
      "questionGrades": [
        {
          "questionId": "question_id",
          "question": "What is the time complexity of binary search?",
          "type": "multiple-choice",
          "studentAnswer": 1,
          "correctAnswer": 1,
          "pointsAwarded": 4,
          "maxPoints": 4,
          "feedback": "Correct!"
        },
        {
          "questionId": "essay_question_id",
          "question": "Explain the concept of recursion with an example.",
          "type": "essay",
          "studentAnswer": "Recursion is when a function calls itself...",
          "pointsAwarded": 18,
          "maxPoints": 20,
          "feedback": "Good explanation but could include more examples."
        }
      ],
      "overallFeedback": "Good performance overall.",
      "strengths": ["Strong understanding of algorithms", "Clear explanations"],
      "areasForImprovement": ["Include more examples in essays", "Time management"]
    },
    "exam": {
      "title": "Midterm Examination",
      "duration": 120,
      "totalPoints": 100,
      "passingScore": 60
    }
  }
}
```

---

### Get Assignments
**Endpoint:** `GET /assignments?courseId=:courseId`  
**Access:** Student (must be enrolled)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "assignment_id",
      "title": "Assignment Title",
      "description": "Assignment description",
      "dueDate": "2024-02-01T23:59:59.000Z",
      "maxScore": 100,
      "submissionStatus": "pending",
      "submittedAt": null,
      "grade": null,
      "feedback": null
    }
  ]
}
```

---

### Submit Assignment
**Endpoint:** `POST /assignments/:id/submit`  
**Access:** Student (must be enrolled)

**Request Body:**
```json
{
  "content": "Assignment content or text",
  "attachments": ["file_url_1", "file_url_2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "submission_id",
    "assignmentId": "assignment_id",
    "submittedAt": "2024-01-20T18:00:00.000Z",
    "status": "submitted"
  },
  "message": "Assignment submitted successfully"
}
```

---

## Student Analytics

### Get Student Dashboard
**Endpoint:** `GET /analytics/student/dashboard`  
**Access:** Student

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCourses": 5,
      "activeCourses": 3,
      "completedCourses": 2,
      "averageProgress": 68,
      "totalTimeSpent": 18000,
      "learningStreak": 7,
      "achievements": 5
    },
    "recentActivity": [
      {
        "type": "lesson_completed",
        "courseId": "course_id",
        "courseTitle": "Course Title",
        "lessonTitle": "Lesson Title",
        "timestamp": "2024-01-20T15:30:00.000Z"
      }
    ],
    "upcomingDeadlines": [
      {
        "type": "assignment",
        "title": "Assignment Title",
        "courseTitle": "Course Title",
        "dueDate": "2024-02-01T23:59:59.000Z"
      }
    ],
    "progressByField": [
      {
        "field": "Computer Science",
        "courses": 3,
        "averageProgress": 75
      }
    ],
    "performanceMetrics": {
      "averageQuizScore": 85,
      "quizzesTaken": 15,
      "assignmentsCompleted": 10,
      "totalAssignments": 12
    }
  }
}
```

---

## Shopping Cart & Payments

### Get Cart
**Endpoint:** `GET /cart`  
**Access:** Student

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "cart_id",
    "items": [
      {
        "courseId": {
          "_id": "course_id",
          "title": "Course Title",
          "thumbnail": "thumbnail_url",
          "price": 99.99,
          "instructor": "Instructor Name"
        },
        "price": 99.99
      }
    ],
    "subtotal": 199.98,
    "total": 199.98,
    "itemCount": 2
  }
}
```

---

### Add to Cart
**Endpoint:** `POST /cart/add`  
**Access:** Student

**Request Body:**
```json
{
  "courseId": "course_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {...},
    "message": "Course added to cart"
  }
}
```

---

### Remove from Cart
**Endpoint:** `DELETE /cart/remove/:courseId`  
**Access:** Student

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {...},
    "message": "Course removed from cart"
  }
}
```

---

### Create Checkout Session
**Endpoint:** `POST /payments/checkout`  
**Access:** Student

**Request Body:**
```json
{
  "cartId": "cart_id",
  "paymentMethod": "stripe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "stripe_session_id",
    "checkoutUrl": "https://checkout.stripe.com/pay/...",
    "orderId": "order_id"
  }
}
```

---

### Enroll in Free Course
**Endpoint:** `POST /payments/enroll-free/:courseId`  
**Access:** Student

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "order_id",
      "status": "completed",
      "total": 0
    },
    "message": "Successfully enrolled in free course"
  }
}
```

---

## Notifications

### Get Notifications
**Endpoint:** `GET /notifications`  
**Access:** Student

**Query Parameters:**
- `isRead` (boolean, optional) - Filter by read status
- `type` (string, optional) - Filter by type
- `page` (number, optional) - Page number - default: 1
- `limit` (number, optional) - Items per page - default: 20

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "notification_id",
      "type": "assignment_graded",
      "title": "Assignment Graded",
      "message": "Your assignment has been graded",
      "data": {
        "assignmentId": "assignment_id",
        "courseId": "course_id",
        "grade": 95
      },
      "isRead": false,
      "createdAt": "2024-01-20T10:00:00.000Z"
    }
  ],
  "pagination": {...},
  "unreadCount": 5
}
```

---

### Mark Notification as Read
**Endpoint:** `PATCH /notifications/:id/read`  
**Access:** Student

**Response:**
```json
{
  "success": true,
  "data": {
    "notificationId": "notification_id",
    "isRead": true
  }
}
```

---

### Mark All Notifications as Read
**Endpoint:** `PATCH /notifications/read-all`  
**Access:** Student

**Response:**
```json
{
  "success": true,
  "data": {
    "markedCount": 5
  },
  "message": "All notifications marked as read"
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "message": "Error message description",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes

- `401` - Unauthorized (not logged in or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `400` - Bad request (validation errors)
- `429` - Too many requests (rate limit exceeded)
- `500` - Internal server error

### Common Error Messages

- **Not Enrolled:** `You must be enrolled in this course to access this resource`
- **Course Full:** `This course has reached maximum enrollment`
- **Invalid ID:** `Invalid course/lesson/exam ID format`
- **Already Enrolled:** `Already enrolled in this course`
- **Assignment Late:** `Assignment submission deadline has passed`
- **Exam Not Available:** `This exam is not currently available`
- **Exam Already Started:** `You have already started this exam`
- **Exam Session Expired:** `Your exam session has expired`
- **Exam Attempts Exceeded:** `Maximum exam attempts reached`

---

## Rate Limiting

All API endpoints are rate-limited:
- **Window:** 15 minutes
- **Max Requests:** 100 requests per window
- **Response when exceeded:** `429 Too Many Requests`

To check rate limit status, examine response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Websocket Events (Real-time Updates)

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events

**Lesson Progress:**
```javascript
socket.on('lesson:completed', (data) => {
  // data: { lessonId, courseId, progress }
});
```

**Exam Graded:**
```javascript
socket.on('exam:graded', (data) => {
  // data: { examId, submissionId, score, passed, letterGrade }
});
```

**Exam Starting Soon:**
```javascript
socket.on('exam:starting-soon', (data) => {
  // data: { examId, title, scheduledDate, minutesUntilStart }
});
```

**Assignment Feedback:**
```javascript
socket.on('assignment:graded', (data) => {
  // data: { assignmentId, grade, feedback }
});
```

**New Notifications:**
```javascript
socket.on('notification:new', (data) => {
  // data: { notification object }
});
```

---

## Best Practices

1. **Always check enrollment status** before accessing course content
2. **Cache course lists** to reduce API calls
3. **Use pagination** for large data sets
4. **Handle errors gracefully** with user-friendly messages
5. **Implement offline support** for lesson content viewing
6. **Track analytics** for lesson views and time spent
7. **Prefetch next lesson** for smooth user experience
8. **Validate input** before submitting forms
9. **Show loading states** during API calls
10. **Implement retry logic** for failed requests

---

## Support

For questions or issues:
- Email: support@cognerax.com
- Documentation: https://docs.cognerax.com
- API Status: https://status.cognerax.com

---

**Last Updated:** December 2025  
**API Version:** v1

> **Note:** The Quiz system has been replaced with a comprehensive Exam system. All quiz-related endpoints are deprecated. Use the new `/exams/*` endpoints instead.

