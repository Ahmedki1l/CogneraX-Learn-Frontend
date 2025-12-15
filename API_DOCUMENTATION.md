# Complete API Documentation

**Last Updated**: December 5, 2025  
**Base URL**: `http://localhost:5000/api/v1`  
**Version**: v1

---

## Overview

This document contains comprehensive API documentation for the AI Education Platform backend. All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management](#user-management)
3. [Student Management](#student-management)
4. [Course & Lesson Management](#course--lesson-management)
5. [Exam System](#exam-system)
6. [AI Features](#ai-features)
7. [Analytics](#analytics)
8. [E-Commerce](#e-commerce)
9. [System Administration](#system-administration)
10. [Platform Configuration](#platform-configuration)

For detailed endpoint specifications, see:
- **Student Endpoints**: [STUDENT_ENDPOINTS_DOCUMENTATION.md](./STUDENT_ENDPOINTS_DOCUMENTATION.md)
- **Backend Requirements**: [BACKEND_REQUIREMENTS_INSTRUCTOR_PERMISSIONS.md](./BACKEND_REQUIREMENTS_INSTRUCTOR_PERMISSIONS.md), [BACKEND_REQUIREMENTS_STUDENT_FEATURES.md](./BACKEND_REQUIREMENTS_STUDENT_FEATURES.md)
- **Specific Specifications**: [docs/](./docs/) folder

---

## Authentication Endpoints

### Login
- **POST** `/auth/login`
- **Body**: `{ "email": "string", "password": "string" }`
- **Returns**: JWT token, refresh token, user data

### Register
- **POST** `/auth/register`
- **Body**: `{ "name": "string", "email": "string", "password": "string", "role": "string" }`

### Get Current User
- **GET** `/auth/me`
- **Returns**: Current user profile

### Refresh Token
- **POST** `/auth/refresh-token`
- **Body**: `{ "refreshToken": "string" }`

### Register with Invitation
- **POST** `/auth/register/invitation`
- **Body**: `{ "token": "string", "name": "string", "password": "string" }`

### Forgot Password
- **POST** `/auth/forgot-password`
- **Body**: `{ "email": "string" }`

### Reset Password
- **POST** `/auth/reset-password/:token`
- **Body**: `{ "password": "string" }`

### Update Password
- **PUT** `/auth/update-password`
- **Body**: `{ "currentPassword": "string", "newPassword": "string" }`

### Logout
- **POST** `/auth/logout`

---

## User Management

### Get All Users
- **GET** `/users`
- **Access**: Admin
- **Query**: `role`, `organization`, `status`, `search`, `page`, `limit`

### Create User
- **POST** `/users`
- **Access**: Admin
- **Body**: `{ "name": "string", "email": "string", "role": "string", "permissions": [] }`

### Update User
- **PUT** `/users/:id`
- **Access**: Admin

### Delete User
- **DELETE** `/users/:id`
- **Access**: Admin

### Update User Permissions
- **PATCH** `/users/:id/permissions`
- **Access**: Admin

---

## Student Management

### Get All Students
- **GET** `/students`
- **Access**: Admin/Instructor
- **Query**: `course`, `search`, `status`, `page`, `limit`

### Get Student Progress
- **GET** `/students/:id/progress`
- **Access**: Admin/Instructor

### Invite Students
- **POST** `/students/invite`
- **Access**: Admin/Instructor
- **Body**: `{ "emails": [], "courseId": "string", "message": "string" }`

For complete student endpoints, see [STUDENT_ENDPOINTS_DOCUMENTATION.md](./STUDENT_ENDPOINTS_DOCUMENTATION.md)

---

## Course & Lesson Management

### Get Courses
- **GET** `/courses`
- **Query**: `field`, `status`, `search`, `page`, `limit`

### Create Course
- **POST** `/courses`
- **Access**: Instructor/Admin

### Update Course
- **PUT** `/courses/:id`
- **Access**: Instructor/Admin

### Get Lessons
- **GET** `/courses/:id/lessons`

### Create Lesson
- **POST** `/courses/:courseId/lessons`
- **Access**: Instructor/Admin
- **Content-Type**: `multipart/form-data`
- See [LESSON_CREATION_FRONTEND_GUIDE.md](./LESSON_CREATION_FRONTEND_GUIDE.md) for details

---

## Exam System

### Get Exams
- **GET** `/exams`
- **Query**: `courseId`, `fieldId`, `status`, `search`, `page`, `limit`

### Create Exam
- **POST** `/exams`
- **Access**: Instructor/Admin

### Get Exam
- **GET** `/exams/:id`

### Update Exam
- **PUT** `/exams/:id`
- **Access**: Instructor/Admin

### Delete Exam
- **DELETE** `/exams/:id`
- **Access**: Instructor/Admin

### Schedule Exam
- **POST** `/exams/:id/schedule`
- **Body**: `{ "scheduledDate": "string", "duration": number }`

### Duplicate Exam
- **POST** `/exams/:id/duplicate`
- **Access**: Instructor/Admin

For detailed exam endpoints, see [docs/BACKEND_EXAM_ENDPOINTS_SPECIFICATION.md](./docs/BACKEND_EXAM_ENDPOINTS_SPECIFICATION.md)

---

## AI Features

### Analyze Content
- **POST** `/ai/analyze-content`
- **Access**: Instructor/Admin
- **Credits**: 10
- **Body**: `{ "content": "string", "analysisType": "string", "language": "string" }`

### Enhance Content
- **POST** `/ai/recreate-content`
- **Access**: Instructor/Admin
- **Credits**: 25
- **Body**: `{ "originalContent": "string", "enhancementType": "string", "language": "string" }`

### Generate Teaching Plan
- **POST** `/ai/generate-teaching-plan`
- **Access**: Instructor/Admin
- **Credits**: 50
- **Body**: `{ "content": "string", "sessionMinutes": number, "studentLevel": "string", "language": "string" }`

### Generate Questions
- **POST** `/ai/generate-questions`
- **Access**: Instructor/Admin
- **Credits**: 1 per question
- **Body**: `{ "content": "string", "count": number, "questionTypes": [], "difficulty": "string", "language": "string" }`

### Generate Exam
- **POST** `/ai/generate-exam`
- **Access**: Instructor/Admin
- **Credits**: 1 per question
- **Body**: `{ "content": "string", "examConfig": {}, "language": "string" }`

### Grade Essay
- **POST** `/ai/grade-essay`
- **Access**: Instructor/Admin
- **Credits**: 2 per essay
- **Body**: `{ "essayContent": "string", "rubric": "string", "maxScore": number, "language": "string" }`

### Get AI Credits Balance
- **GET** `/ai/credits/balance`
- **Returns**: Credit balance

### Allocate Credits
- **POST** `/ai/credits/allocate`
- **Access**: Admin
- **Body**: `{ "userId": "string", "amount": number, "description": "string" }`

For AI integration details, see [AI_FRONTEND_INTEGRATION.md](./AI_FRONTEND_INTEGRATION.md)

---

## Analytics

### Platform Analytics
- **GET** `/analytics/platform`
- **Access**: Admin
- **Query**: `period`, `startDate`, `endDate`

### Student Analytics
- **GET** `/analytics/student/dashboard`
- **Access**: Student

### Instructor Analytics
- **GET** `/analytics/instructor/dashboard`
- **Access**: Instructor

---

## E-Commerce

### Get Cart
- **GET** `/cart`
- **Access**: Authenticated users

### Add to Cart
- **POST** `/cart/items`
- **Body**: `{ "courseId": "string", "quantity": number }`

### Remove from Cart
- **DELETE** `/cart/items/:id`

### Create Payment Intent
- **POST** `/payments/create-intent`
- **Body**: `{ "courseIds": [], "amount": number }`

### Confirm Payment
- **POST** `/payments/confirm`
- **Body**: `{ "paymentIntentId": "string" }`

### Free Enrollment
- **POST** `/payments/enroll-free/:courseId`

---

## System Administration

### Get System Metrics
- **GET** `/system/metrics`
- **Access**: Admin

### Get Audit Logs
- **GET** `/system/audit-logs`
- **Access**: Admin
- **Query**: `userId`, `action`, `startDate`, `endDate`, `page`, `limit`

### Create Backup
- **POST** `/system/backups`
- **Access**: Admin

### Restore Backup
- **POST** `/system/backups/:id/restore`
- **Access**: Admin

---

## Platform Configuration

### Get Integrations
- **GET** `/config/integrations`
- **Access**: Admin

### Update Integration
- **PUT** `/config/integrations/:id`
- **Access**: Admin

### Get Feature Flags
- **GET** `/config/feature-flags`
- **Access**: Admin

### Update Feature Flag
- **PATCH** `/config/feature-flags/:id`
- **Access**: Admin

### Get Branding Settings
- **GET** `/config/branding`
- **Access**: Admin

### Update Branding Settings
- **PUT** `/config/branding`
- **Access**: Admin

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "string",
    "code": "string"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Additional Documentation

For more detailed information:

- **Student Endpoints**: [STUDENT_ENDPOINTS_DOCUMENTATION.md](./STUDENT_ENDPOINTS_DOCUMENTATION.md)
- **Backend Requirements**: 
  - [BACKEND_REQUIREMENTS_INSTRUCTOR_PERMISSIONS.md](./BACKEND_REQUIREMENTS_INSTRUCTOR_PERMISSIONS.md)
  - [BACKEND_REQUIREMENTS_STUDENT_FEATURES.md](./BACKEND_REQUIREMENTS_STUDENT_FEATURES.md)
- **Specific Endpoints**: [docs/](./docs/) folder
  - Gradebook endpoints
  - Exam endpoints
  - Question Bank endpoints
  - AI exam generation payloads
- **Integration Guides**:
  - [LESSON_CREATION_FRONTEND_GUIDE.md](./LESSON_CREATION_FRONTEND_GUIDE.md)
  - [FRONTEND_INVITATION_GUIDE.md](./FRONTEND_INVITATION_GUIDE.md)
  - [AI_FRONTEND_INTEGRATION.md](./AI_FRONTEND_INTEGRATION.md)

---

**Last Updated**: December 5, 2025  
**Total Endpoints**: 200+  
**Status**: ✅ Production Ready
