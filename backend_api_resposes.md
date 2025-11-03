# AI Education Platform - API Endpoints Documentation

## 📋 Overview

This document contains all the working API endpoints for the AI Education Platform backend. All endpoints require authentication via JWT token in the `Authorization` header.

**Base URL:** `http://localhost:5000/api/v1`

**Authentication:** Include JWT token in request header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Login
- **POST** `/auth/login`
- **Description:** Authenticate user and get JWT token
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Register
- **POST** `/auth/register`
- **Description:** Register new user
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password123",
    "role": "student"
  }
  ```

### Refresh Token
- **POST** `/auth/refresh`
- **Description:** Refresh JWT token

### Register with Invitation
- **POST** `/auth/register/invitation`
- **Description:** Register using invitation token
- **Body:**
  ```json
  {
    "token": "invitation-token",
    "name": "John Doe",
    "password": "password123"
  }
  ```

### Forgot Password
- **POST** `/auth/forgot-password`
- **Description:** Request password reset
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```

### Reset Password
- **POST** `/auth/reset-password/:token`
- **Description:** Reset password using token
- **Body:**
  ```json
  {
    "password": "newPassword123"
  }
  ```

### Verify Email
- **GET** `/auth/verify-email/:token`
- **Description:** Verify email address

### Refresh Token
- **POST** `/auth/refresh-token`
- **Description:** Refresh JWT token

### Get Current User
- **GET** `/auth/me`
- **Access:** Authenticated users
- **Description:** Get current user profile

### Update Password
- **PUT** `/auth/update-password`
- **Access:** Authenticated users
- **Body:**
  ```json
  {
    "currentPassword": "currentPassword",
    "newPassword": "newPassword123"
  }
  ```

### Logout
- **POST** `/auth/logout`
- **Description:** Logout user

---

## 👥 User Management Endpoints

### Get All Users
- **GET** `/users`
- **Access:** Admin with `manage_users` permission
- **Query Parameters:**
  - `role` - Filter by role (student, instructor, admin)
  - `organization` - Filter by organization ID
  - `status` - Filter by status (active, inactive, suspended)
  - `search` - Search by name or email
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 10)
  - `sortBy` - Sort field (default: createdAt)
  - `sortOrder` - Sort order (asc, desc)

### Get User by ID
- **GET** `/users/:id`
- **Access:** Admin with `manage_users` permission
- **Description:** Get specific user details

### Create User
- **POST** `/users`
- **Access:** Admin with `manage_users` permission
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password123",
    "role": "student",
    "organization": "organizationId"
  }
  ```

### Update User
- **PUT** `/users/:id`
- **Access:** Admin with `manage_users` permission
- **Body:**
  ```json
  {
    "name": "Updated Name",
    "email": "updated@example.com",
    "status": "active"
  }
  ```

### Delete User
- **DELETE** `/users/:id`
- **Access:** Admin with `manage_users` permission

### Update User Role
- **PATCH** `/users/:id/role`
- **Access:** Admin with `manage_users` permission
- **Body:**
  ```json
  {
    "role": "instructor"
  }
  ```

### Update User Permissions
- **PATCH** `/users/:id/permissions`
- **Access:** Admin with `manage_users` permission
- **Body:**
  ```json
  {
    "permissions": ["create_course", "view_analytics"]
  }
  ```

### Bulk User Actions
- **POST** `/users/bulk`
- **Access:** Admin with `manage_users` permission
- **Body:**
  ```json
  {
    "action": "suspend",
    "userIds": ["userId1", "userId2"],
    "reason": "Policy violation"
  }
  ```

### Export Users
- **GET** `/users/export`
- **Access:** Admin with `export_data` permission
- **Query Parameters:**
  - `format` - Export format (csv, json)
  - `startDate` - Filter from date
  - `endDate` - Filter to date

---

## 🎓 Student Management Endpoints

### Get All Students
- **GET** `/students`
- **Access:** Admin/Instructor with `view_analytics` permission
- **Query Parameters:**
  - `course` - Filter by course ID
  - `search` - Search by name or email
  - `status` - Filter by enrollment status
  - `page` - Page number
  - `limit` - Items per page

### Get Student Details
- **GET** `/students/:id`
- **Access:** Admin/Instructor with `view_analytics` permission
- **Description:** Get detailed student information

### Get All Students Progress
- **GET** `/students/all/progress`
- **Access:** Admin/Instructor with `view_analytics` permission
- **Query Parameters:**
  - `courseId` - Filter by specific course ID or "all"
  - `timeRange` - Time range for analytics (7d, 30d, 90d, 1y) - default: 30d
  - `page` - Page number - default: 1
  - `limit` - Items per page - default: 10
- **Description:** Get progress overview for all students with summary statistics

### Get Student Progress
- **GET** `/students/:id/progress`
- **Access:** Admin/Instructor with `view_analytics` permission
- **Description:** Get student's course progress and performance

### Invite Students
- **POST** `/students`
- **Access:** Admin/Instructor with `manage_users` permission
- **Body:**
  ```json
  {
    "emails": ["student1@example.com", "student2@example.com"],
    "courseId": "courseId",
    "message": "Welcome to our course!"
  }
  ```

### Export Students Data
- **GET** `/students/export`
- **Access:** Admin with `export_data` permission
- **Query Parameters:**
  - `format` - Export format (csv, json)
  - `course` - Filter by course
  - `startDate` - Filter from date
  - `endDate` - Filter to date

---

## ⚙️ System Administration Endpoints

### Get System Metrics
- **GET** `/system/metrics`
- **Access:** Admin with `view_system_metrics` permission
- **Description:** Get CPU, memory, disk usage, and active users

### Get Audit Logs
- **GET** `/system/audit-logs`
- **Access:** Admin with `view_analytics` permission
- **Query Parameters:**
  - `userId` - Filter by user ID
  - `action` - Filter by action type
  - `resourceType` - Filter by resource type
  - `startDate` - Filter from date
  - `endDate` - Filter to date
  - `page` - Page number
  - `limit` - Items per page

### Get Backups
- **GET** `/system/backups`
- **Access:** Admin with `manage_backups` permission
- **Description:** List all database backups

### Create Backup
- **POST** `/system/backups`
- **Access:** Admin with `manage_backups` permission
- **Body:**
  ```json
  {
    "type": "full",
    "description": "Scheduled backup"
  }
  ```

### Restore Backup
- **POST** `/system/backups/:id/restore`
- **Access:** Admin with `manage_backups` permission
- **Description:** Restore from specific backup

### Get Compliance Reports
- **GET** `/system/compliance-reports`
- **Access:** Admin with `view_analytics` permission
- **Query Parameters:**
  - `type` - Report type (gdpr, sox, hipaa)
  - `startDate` - Report start date
  - `endDate` - Report end date

---

## 🔧 Platform Configuration Endpoints

### Get Integrations
- **GET** `/config/integrations`
- **Access:** Admin with `manage_integrations` permission
- **Description:** Get all platform integrations (Stripe, SendGrid, etc.)

### Update Integration
- **PUT** `/config/integrations/:id`
- **Access:** Admin with `manage_integrations` permission
- **Body:**
  ```json
  {
    "enabled": true,
    "settings": {
      "apiKey": "new-api-key",
      "webhookUrl": "https://example.com/webhook"
    }
  }
  ```

### Get Feature Flags
- **GET** `/config/feature-flags`
- **Access:** Admin with `manage_feature_flags` permission
- **Description:** Get all feature flags and their status

### Update Feature Flag
- **PATCH** `/config/feature-flags/:id`
- **Access:** Admin with `manage_feature_flags` permission
- **Body:**
  ```json
  {
    "enabled": true,
    "description": "Enable new UI components"
  }
  ```

### Get Branding Settings
- **GET** `/config/branding`
- **Access:** Admin with `manage_settings` permission
- **Description:** Get platform branding configuration

### Update Branding Settings
- **PUT** `/config/branding`
- **Access:** Admin with `manage_settings` permission
- **Body:**
  ```json
  {
    "logoUrl": "https://example.com/logo.png",
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d",
    "faviconUrl": "https://example.com/favicon.ico"
  }
  ```

### Get System Configuration
- **GET** `/config/system`
- **Access:** Admin with `manage_settings` permission
- **Description:** Get system configuration settings

### Update System Configuration
- **PUT** `/config/system`
- **Access:** Admin with `manage_settings` permission
- **Body:**
  ```json
  {
    "settings": {
      "allowSelfRegistration": true,
      "requireEmailVerification": true,
      "defaultUserRole": "student"
    }
  }
  ```

### Reset Configuration
- **POST** `/config/reset`
- **Access:** Admin with `manage_settings` permission
- **Description:** Reset configuration to defaults

---

## 🤖 AI Features & Credits Management Endpoints

### Analyze Content
- **POST** `/ai/analyze-content`
- **Access:** Instructors/Admins
- **Body:**
  ```json
  {
    "content": "Course content to analyze",
    "type": "lesson",
    "courseId": "courseId"
  }
  ```

### Recreate Content
- **POST** `/ai/recreate-content`
- **Access:** Instructors/Admins
- **Body:**
  ```json
  {
    "originalContent": "Original content",
    "style": "formal",
    "length": "medium"
  }
  ```

### Generate Teaching Plan
- **POST** `/ai/generate-teaching-plan`
- **Access:** Instructors/Admins
- **Body:**
  ```json
  {
    "topic": "Web Development",
    "duration": "8 weeks",
    "level": "beginner"
  }
  ```

### Generate Questions
- **POST** `/ai/generate-questions`
- **Access:** Instructors/Admins
- **Body:**
  ```json
  {
    "content": "Lesson content",
    "questionType": "multiple_choice",
    "count": 10
  }
  ```

### Generate Exam
- **POST** `/ai/generate-exam`
- **Access:** Instructors/Admins
- **Body:**
  ```json
  {
    "courseId": "courseId",
    "duration": 60,
    "questionCount": 20
  }
  ```

### Grade Essay
- **POST** `/ai/grade-essay`
- **Access:** Instructors/Admins
- **Body:**
  ```json
  {
    "essay": "Student essay content",
    "rubric": "Grading criteria",
    "maxScore": 100
  }
  ```

### Get Credits Balance
- **GET** `/ai/credits/balance`
- **Access:** Authenticated users
- **Description:** Get current user's AI credits balance

### Allocate Credits
- **POST** `/ai/credits/allocate`
- **Access:** Admin with `manage_ai_credits` permission
- **Body:**
  ```json
  {
    "userId": "userId",
    "amount": 50,
    "description": "Credit allocation"
  }
  ```

### Get AI Credits Stats
- **GET** `/ai/ai-credits/stats`
- **Access:** Admin with `manage_ai_credits` permission
- **Description:** Get comprehensive AI credits statistics

### Get AI Credits History
- **GET** `/ai/ai-credits/history`
- **Access:** Admin with `manage_ai_credits` permission
- **Query Parameters:**
  - `userId` - Filter by user ID
  - `type` - Filter by transaction type
  - `page` - Page number
  - `limit` - Items per page

### Bulk Allocate Credits
- **POST** `/ai/ai-credits/bulk-allocate`
- **Access:** Admin with `manage_ai_credits` permission
- **Body:**
  ```json
  {
    "allocations": [
      {
        "userId": "userId1",
        "amount": 100,
        "description": "Monthly allocation"
      },
      {
        "userId": "userId2",
        "amount": 150,
        "description": "Bonus credits"
      }
    ]
  }
  ```

### Get Instructor Credits
- **GET** `/ai/ai-credits/instructors`
- **Access:** Admin with `manage_ai_credits` permission
- **Description:** Get AI credits for all instructors

---

## 📊 Analytics Endpoints

### Track Event
- **POST** `/analytics/track`
- **Access:** Authenticated users
- **Body:**
  ```json
  {
    "type": "course_view",
    "courseId": "courseId",
    "lessonId": "lessonId",
    "data": {
      "duration": 120,
      "progress": 75
    }
  }
  ```

### Get Student Dashboard Analytics
- **GET** `/analytics/student/dashboard`
- **Access:** Students
- **Description:** Get student-specific analytics and progress

### Get Instructor Dashboard Analytics
- **GET** `/analytics/instructor/dashboard`
- **Access:** Instructors/Admins
- **Description:** Get instructor-specific analytics and course performance

### Get Course Analytics
- **GET** `/analytics/course/:courseId`
- **Access:** Instructors/Admins (course owner)
- **Description:** Get detailed analytics for a specific course

### Get Platform Analytics
- **GET** `/analytics/platform`
- **Access:** Admin with `view_analytics` permission
- **Description:** Get overall platform metrics and trends

### Get User Engagement Analytics
- **GET** `/analytics/engagement`
- **Access:** Admin with `view_analytics` permission
- **Query Parameters:**
  - `period` - Time period (7d, 30d, 90d, 1y)
- **Description:** Get user engagement metrics including DAU, session duration, retention

### Get Revenue Analytics
- **GET** `/analytics/revenue`
- **Access:** Admin with `view_analytics` permission
- **Query Parameters:**
  - `period` - Time period (7d, 30d, 90d, 1y)
- **Description:** Get revenue metrics, daily breakdown, payment methods

### Get Predictive Analytics
- **GET** `/analytics/predictive`
- **Access:** Admin with `view_analytics` permission
- **Description:** Get predictive insights including user growth, revenue forecasts, churn risk

### Export Analytics Report
- **GET** `/analytics/export/:type`
- **Access:** Admin with `export_data` permission
- **Parameters:**
  - `type` - Report type (platform, engagement, revenue, users, courses)
- **Query Parameters:**
  - `format` - Export format (csv, json)
  - `startDate` - Filter from date
  - `endDate` - Filter to date

---

## 📚 Course Management Endpoints

### Get All Courses
- **GET** `/courses`
- **Access:** Public/Authenticated
- **Query Parameters:**
  - `status` - Filter by status (draft, published, archived)
  - `instructor` - Filter by instructor ID
  - `category` - Filter by category
  - `search` - Search by title or description
  - `page` - Page number
  - `limit` - Items per page

### Get Course Details
- **GET** `/courses/:id`
- **Access:** Public/Authenticated
- **Description:** Get detailed course information

### Get Fields
- **GET** `/courses/fields`
- **Access:** Public/Authenticated
- **Description:** Get all available course fields/categories

### Get Enrolled Courses
- **GET** `/courses/enrolled`
- **Access:** Students
- **Description:** Get courses the current user is enrolled in

### Get Enrolled Courses by Fields
- **GET** `/courses/enrolled/fields`
- **Access:** Students
- **Description:** Get enrolled courses grouped by fields

### Enroll in Course
- **POST** `/courses/:id/enroll`
- **Access:** Students
- **Description:** Enroll in a specific course

### Unenroll from Course
- **DELETE** `/courses/:id/enroll`
- **Access:** Students
- **Description:** Unenroll from a specific course

### Add Course Review
- **POST** `/courses/:id/reviews`
- **Access:** Students/Admins
- **Body:**
  ```json
  {
    "rating": 5,
    "comment": "Great course!"
  }
  ```

### Create Course
- **POST** `/courses`
- **Access:** Instructor/Admin with `create_course` permission
- **Body:**
  ```json
  {
    "title": "Course Title",
    "description": "Course description",
    "category": "categoryId",
    "price": 99.99,
    "thumbnail": "thumbnailUrl"
  }
  ```

### Update Course
- **PUT** `/courses/:id`
- **Access:** Instructor/Admin (course owner)
- **Body:**
  ```json
  {
    "title": "Updated Title",
    "description": "Updated description",
    "status": "published"
  }
  ```

### Delete Course
- **DELETE** `/courses/:id`
- **Access:** Instructor/Admin (course owner)

### Publish Course
- **POST** `/courses/:id/publish`
- **Access:** Instructor/Admin (course owner)
- **Description:** Publish a draft course

### Get Course Students
- **GET** `/courses/:id/students`
- **Access:** Instructor/Admin (course owner)
- **Description:** Get list of students enrolled in the course

---

## 📝 Lesson Management Endpoints

### Get Course Lessons
- **GET** `/courses/:courseId/lessons`
- **Access:** Authenticated users
- **Description:** Get all lessons for a specific course

### Get Lesson Details
- **GET** `/lessons/:id`
- **Access:** Authenticated users
- **Description:** Get detailed lesson information

### Mark Lesson Complete
- **POST** `/lessons/:id/complete`
- **Access:** Students
- **Description:** Mark a lesson as completed

### Get Lesson Resources
- **GET** `/lessons/:id/resources`
- **Access:** Authenticated users
- **Description:** Get resources for a specific lesson

### Get Available Quizzes
- **GET** `/lessons/:id/quizzes`
- **Access:** Authenticated users
- **Description:** Get quizzes available for a lesson

### Add Quiz to Lesson
- **POST** `/lessons/:id/quizzes`
- **Access:** Instructors/Admins
- **Body:**
  ```json
  {
    "quizId": "quizId"
  }
  ```

### Remove Quiz from Lesson
- **DELETE** `/lessons/:id/quizzes/:quizId`
- **Access:** Instructors/Admins
- **Description:** Remove a quiz from a lesson

### Create Lesson
- **POST** `/courses/:courseId/lessons`
- **Access:** Instructor/Admin (course owner)
- **Body:**
  ```json
  {
    "title": "Lesson Title",
    "content": "Lesson content",
    "type": "video",
    "duration": 30,
    "order": 1
  }
  ```

### Update Lesson
- **PUT** `/lessons/:id`
- **Access:** Instructor/Admin (course owner)
- **Body:**
  ```json
  {
    "title": "Updated Title",
    "content": "Updated content"
  }
  ```

### Delete Lesson
- **DELETE** `/lessons/:id`
- **Access:** Instructor/Admin (course owner)

---

## 🎯 Quiz Management Endpoints

### Get Course Quizzes
- **GET** `/courses/:courseId/quizzes`
- **Access:** Authenticated users
- **Description:** Get all quizzes for a specific course

### Get Quiz Details
- **GET** `/quizzes/:id`
- **Access:** Authenticated users
- **Description:** Get detailed quiz information with questions

### Start Quiz
- **POST** `/quizzes/:id/start`
- **Access:** Students/Admins
- **Description:** Start a quiz attempt

### Submit Quiz
- **POST** `/quizzes/:id/submit`
- **Access:** Students/Admins
- **Body:**
  ```json
  {
    "answers": [
      {
        "questionId": "questionId",
        "answer": "selectedAnswer"
      }
    ]
  }
  ```

### Get Quiz Attempts
- **GET** `/quizzes/:id/attempts`
- **Access:** Authenticated users
- **Description:** Get all attempts for a quiz

### Get Quiz Results
- **GET** `/quizzes/:id/results/:attemptId`
- **Access:** Authenticated users
- **Description:** Get results for a specific quiz attempt

### Create Quiz
- **POST** `/courses/:courseId/quizzes`
- **Access:** Instructor/Admin (course owner)
- **Body:**
  ```json
  {
    "title": "Quiz Title",
    "description": "Quiz description",
    "questions": [
      {
        "question": "What is...?",
        "type": "multiple_choice",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0
      }
    ]
  }
  ```

### Update Quiz
- **PUT** `/quizzes/:id`
- **Access:** Instructor/Admin (course owner)
- **Body:**
  ```json
  {
    "title": "Updated Quiz Title",
    "description": "Updated description"
  }
  ```

### Delete Quiz
- **DELETE** `/quizzes/:id`
- **Access:** Instructor/Admin (course owner)

---

## 📋 Assignment Management Endpoints

### Get Course Assignments
- **GET** `/assignments`
- **Access:** Authenticated users
- **Query Parameters:**
  - `courseId` - Filter by course ID
  - `status` - Filter by assignment status
  - `page` - Page number
  - `limit` - Items per page

### Get Assignment Details
- **GET** `/assignments/:id`
- **Access:** Authenticated users
- **Description:** Get detailed assignment information

### Submit Assignment
- **POST** `/assignments/:id/submit`
- **Access:** Students
- **Body:**
  ```json
  {
    "content": "Assignment submission content",
    "attachments": ["file1.pdf", "file2.docx"]
  }
  ```

### Grade Assignment
- **POST** `/assignments/:id/grade/:submissionId`
- **Access:** Instructors/Admins
- **Body:**
  ```json
  {
    "score": 85,
    "feedback": "Good work!",
    "gradedAt": "2024-01-15T10:00:00.000Z"
  }
  ```

### Get Assignment Submissions
- **GET** `/assignments/:id/submissions`
- **Access:** Instructors/Admins
- **Description:** Get all submissions for an assignment

### Create Assignment
- **POST** `/assignments`
- **Access:** Instructors/Admins
- **Body:**
  ```json
  {
    "title": "Assignment Title",
    "description": "Assignment description",
    "courseId": "courseId",
    "dueDate": "2024-01-20T23:59:59.000Z",
    "maxScore": 100
  }
  ```

### Update Assignment
- **PUT** `/assignments/:id`
- **Access:** Instructors/Admins
- **Body:**
  ```json
  {
    "title": "Updated Assignment Title",
    "description": "Updated description",
    "dueDate": "2024-01-25T23:59:59.000Z"
  }
  ```

### Delete Assignment
- **DELETE** `/assignments/:id`
- **Access:** Instructors/Admins

---

## 💰 Payment Management Endpoints

### Create Payment Intent
- **POST** `/payments/create-intent`
- **Access:** Authenticated users
- **Body:**
  ```json
  {
    "courseId": "courseId",
    "amount": 99.99
  }
  ```

### Confirm Payment
- **POST** `/payments/confirm`
- **Access:** Authenticated users
- **Body:**
  ```json
  {
    "paymentIntentId": "paymentIntentId",
    "courseId": "courseId"
  }
  ```

### Get Payment History
- **GET** `/payments/history`
- **Access:** Authenticated users
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page

### Stripe Webhook
- **POST** `/payments/webhook`
- **Access:** Stripe webhook
- **Description:** Handle Stripe webhook events

### Enroll in Free Course
- **POST** `/payments/enroll-free/:courseId`
- **Access:** Authenticated users
- **Description:** Enroll in a free course without payment

### Get Orders
- **GET** `/payments/orders`
- **Access:** Authenticated users
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page

### Get Order Details
- **GET** `/payments/orders/:id`
- **Access:** Order owner or Admin
- **Description:** Get detailed order information

---

## 🔔 Notification Endpoints

### Get User Notifications
- **GET** `/notifications`
- **Access:** Authenticated users
- **Query Parameters:**
  - `unread` - Filter unread notifications
  - `type` - Filter by notification type
  - `page` - Page number
  - `limit` - Items per page

### Mark Notification as Read
- **PATCH** `/notifications/:id/read`
- **Access:** Authenticated users

### Mark All Notifications as Read
- **PATCH** `/notifications/read-all`
- **Access:** Authenticated users

### Delete Notification
- **DELETE** `/notifications/:id`
- **Access:** Notification owner

### Create Notification
- **POST** `/notifications`
- **Access:** Instructors/Admins
- **Body:**
  ```json
  {
    "title": "Notification Title",
    "message": "Notification message",
    "type": "info",
    "userId": "userId"
  }
  ```

### Send Bulk Notification
- **POST** `/notifications/bulk`
- **Access:** Admin
- **Body:**
  ```json
  {
    "title": "Bulk Notification",
    "message": "Message for all users",
    "type": "announcement",
    "targetRoles": ["student", "instructor"]
  }
  ```

---

## 🏢 Organization Management Endpoints

### Get All Organizations
- **GET** `/organizations`
- **Access:** Admin
- **Query Parameters:**
  - `search` - Search by name
  - `status` - Filter by status
  - `page` - Page number
  - `limit` - Items per page

### Get Organization Details
- **GET** `/organizations/:id`
- **Access:** Admin or organization member

### Create Organization
- **POST** `/organizations`
- **Access:** Admin
- **Body:**
  ```json
  {
    "name": "Organization Name",
    "domain": "example.com",
    "settings": {
      "maxUsers": 100,
      "features": ["analytics", "custom_branding"]
    }
  }
  ```

### Update Organization
- **PUT** `/organizations/:id`
- **Access:** Admin or organization admin

### Delete Organization
- **DELETE** `/organizations/:id`
- **Access:** Admin

---

## 🏷️ Field Management Endpoints

### Get All Fields
- **GET** `/fields`
- **Access:** Public/Authenticated
- **Query Parameters:**
  - `search` - Search by field name
  - `page` - Page number
  - `limit` - Items per page

### Get Field Details
- **GET** `/fields/:id`
- **Access:** Public/Authenticated
- **Description:** Get detailed field information

### Create Field
- **POST** `/fields`
- **Access:** Admin
- **Body:**
  ```json
  {
    "name": "Computer Science",
    "description": "Programming and software development",
    "color": "#007bff"
  }
  ```

### Update Field
- **PUT** `/fields/:id`
- **Access:** Admin
- **Body:**
  ```json
  {
    "name": "Updated Field Name",
    "description": "Updated description"
  }
  ```

### Delete Field
- **DELETE** `/fields/:id`
- **Access:** Admin

### Assign Instructors to Field
- **POST** `/fields/:id/assign-instructors`
- **Access:** Admin
- **Body:**
  ```json
  {
    "instructorIds": ["instructorId1", "instructorId2"]
  }
  ```

### Remove Instructors from Field
- **DELETE** `/fields/:id/assign-instructors`
- **Access:** Admin
- **Body:**
  ```json
  {
    "instructorIds": ["instructorId1", "instructorId2"]
  }
  ```

---

## 📁 File Upload Endpoints

### Upload Avatar
- **POST** `/upload/avatar`
- **Access:** Authenticated users
- **Body:** Multipart form data with `avatar` file

### Upload Course Thumbnail
- **POST** `/upload/course-thumbnail`
- **Access:** Instructor/Admin
- **Body:** Multipart form data with `thumbnail` file

### Upload Lesson Resource
- **POST** `/upload/lesson-resource`
- **Access:** Instructor/Admin
- **Body:** Multipart form data with `resource` file

### Upload Video
- **POST** `/upload/video`
- **Access:** Instructor/Admin
- **Body:** Multipart form data with `video` file

### Upload Multiple Files
- **POST** `/upload/multiple/:type`
- **Access:** Authenticated users
- **Body:** Multipart form data with multiple `files`
- **Description:** Upload multiple files of specified type

### Get File Info
- **GET** `/upload/:type/:filename`
- **Access:** Authenticated users
- **Description:** Get information about uploaded file

### Delete File
- **DELETE** `/upload/:type/:filename`
- **Access:** File owner or Admin
- **Description:** Delete uploaded file

### Upload Course Thumbnail
- **POST** `/upload/course-thumbnail/:courseId`
- **Access:** Course owner or Admin
- **Body:** Multipart form data with `thumbnail` file

---

## 💬 Forum Management Endpoints

### Get Forum Topics
- **GET** `/forums`
- **Access:** Authenticated users
- **Query Parameters:**
  - `courseId` - Filter by course ID
  - `search` - Search by topic title
  - `page` - Page number
  - `limit` - Items per page

### Get Topic Details
- **GET** `/forums/:id`
- **Access:** Authenticated users
- **Description:** Get detailed topic information with replies

### Create Topic
- **POST** `/forums`
- **Access:** Authenticated users
- **Body:**
  ```json
  {
    "title": "Topic Title",
    "content": "Topic content",
    "courseId": "courseId"
  }
  ```

### Update Topic
- **PUT** `/forums/:id`
- **Access:** Topic author or Admin
- **Body:**
  ```json
  {
    "title": "Updated Title",
    "content": "Updated content"
  }
  ```

### Delete Topic
- **DELETE** `/forums/:id`
- **Access:** Topic author or Admin

### Add Reply to Topic
- **POST** `/forums/:id/replies`
- **Access:** Authenticated users
- **Body:**
  ```json
  {
    "content": "Reply content"
  }
  ```

### Update Reply
- **PUT** `/forums/:id/replies/:replyId`
- **Access:** Reply author or Admin
- **Body:**
  ```json
  {
    "content": "Updated reply content"
  }
  ```

### Delete Reply
- **DELETE** `/forums/:id/replies/:replyId`
- **Access:** Reply author or Admin

### Like Topic
- **POST** `/forums/:id/like`
- **Access:** Authenticated users

### Like Reply
- **POST** `/forums/:id/replies/:replyId/like`
- **Access:** Authenticated users

---

## 🛒 Cart Management Endpoints

### Get Cart Items
- **GET** `/cart`
- **Access:** Authenticated users
- **Description:** Get current user's cart items

### Add Item to Cart
- **POST** `/cart/items`
- **Access:** Authenticated users
- **Body:**
  ```json
  {
    "courseId": "courseId"
  }
  ```

### Remove Item from Cart
- **DELETE** `/cart/items/:courseId`
- **Access:** Authenticated users
- **Description:** Remove a course from cart

### Apply Coupon
- **POST** `/cart/coupon`
- **Access:** Authenticated users
- **Body:**
  ```json
  {
    "code": "DISCOUNT20"
  }
  ```

### Remove Coupon
- **DELETE** `/cart/coupon`
- **Access:** Authenticated users
- **Description:** Remove applied coupon from cart

---

## 👨‍💼 Admin Management Endpoints

### Suspend User
- **PUT** `/admin/users/:id/suspend`
- **Access:** Admin
- **Body:**
  ```json
  {
    "reason": "Policy violation",
    "duration": "7d"
  }
  ```

### Activate User
- **PUT** `/admin/users/:id/activate`
- **Access:** Admin
- **Description:** Reactivate a suspended user

### Get System Stats
- **GET** `/admin/stats`
- **Access:** Admin
- **Description:** Get comprehensive system statistics

### Get Platform Analytics
- **GET** `/admin/analytics`
- **Access:** Admin
- **Description:** Get platform-wide analytics data

### Manage System Settings
- **PUT** `/admin/settings`
- **Access:** Admin
- **Body:**
  ```json
  {
    "settingName": "value",
    "anotherSetting": "anotherValue"
  }
  ```

---

## 🔗 Invitation Endpoints

### Send Invitation
- **POST** `/invitations`
- **Access:** Admin/Instructor
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "role": "student",
    "courseId": "courseId",
    "organizationId": "organizationId"
  }
  ```

### Get Invitations
- **GET** `/invitations`
- **Access:** Admin
- **Query Parameters:**
  - `status` - Filter by status (pending, accepted, expired)
  - `organization` - Filter by organization
  - `page` - Page number
  - `limit` - Items per page

### Get Invitation by Token
- **GET** `/invitations/token/:token`
- **Access:** Public
- **Description:** Get invitation details by token

### Get All Invitations
- **GET** `/invitations`
- **Access:** Admin
- **Query Parameters:**
  - `status` - Filter by status (pending, accepted, expired)
  - `organization` - Filter by organization
  - `page` - Page number
  - `limit` - Items per page

### Get Invitation Stats
- **GET** `/invitations/stats`
- **Access:** Admin
- **Description:** Get invitation statistics

### Resend Invitation
- **POST** `/invitations/:id/resend`
- **Access:** Admin
- **Description:** Resend invitation email

### Revoke Invitation
- **DELETE** `/invitations/:id`
- **Access:** Admin
- **Description:** Revoke an invitation

### Accept Invitation
- **POST** `/invitations/:token/accept`
- **Access:** Public
- **Body:**
  ```json
  {
    "password": "password123",
    "name": "User Name"
  }
  ```

---

## 📊 Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 🔒 Permissions

The following permissions are available in the system:

- `create_course` - Create and manage courses
- `delete_user` - Delete user accounts
- `manage_settings` - Manage platform settings
- `view_analytics` - View analytics and reports
- `manage_users` - Manage user accounts
- `manage_organizations` - Manage organizations
- `manage_ai_credits` - Manage AI credits allocation
- `export_data` - Export data from the system
- `view_system_metrics` - View system performance metrics
- `manage_backups` - Manage database backups
- `manage_feature_flags` - Manage feature flags
- `manage_integrations` - Manage third-party integrations

### Admin User Permissions

**All admin users automatically have ALL permissions listed above.** This ensures that administrators have complete access to all system features and can manage the platform effectively.

### Permission Management Scripts

The following scripts are available for managing admin permissions:

- `scripts/verify-admin-permissions.js` - Verify all admin users have complete permissions
- `scripts/ensure-admin-permissions.js` - Ensure all admin users have all permissions
- `scripts/create-admin-user.js` - Create a new admin user with all permissions

**Usage Examples:**
```bash
# Verify admin permissions
node scripts/verify-admin-permissions.js

# Ensure all admins have all permissions
node scripts/ensure-admin-permissions.js

# Create new admin user
node scripts/create-admin-user.js "Admin Name" "admin@example.com" "password123"
```

---

## 📝 Notes

1. **Authentication Required:** All endpoints require a valid JWT token in the Authorization header
2. **Rate Limiting:** API requests are rate-limited to prevent abuse
3. **CORS:** Cross-origin requests are configured for frontend integration
4. **Error Handling:** All endpoints return consistent error responses
5. **Validation:** Input validation is performed on all request bodies
6. **Logging:** All API requests are logged for audit purposes

---

## 🚀 Getting Started

1. **Start the server:** `npm run dev`
2. **Server runs on:** `http://localhost:5000`
3. **API Base URL:** `http://localhost:5000/api/v1`
4. **Authentication:** Register/login to get JWT token
5. **Include token:** Add `Authorization: Bearer <token>` to all requests

---

*Last updated: January 2025*
*Total Endpoints: 100+ working endpoints*
*Status: ✅ Production Ready*
