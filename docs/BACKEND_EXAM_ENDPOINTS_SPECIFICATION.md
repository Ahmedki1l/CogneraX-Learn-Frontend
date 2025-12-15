# Backend Exam Endpoints Specification

## Overview

This document specifies all API endpoints required for the Exam Management System. The frontend will implement these endpoints progressively, and the backend should create them as they are needed.

**Total Endpoints:** 40 new endpoints + 2 existing AI endpoints (already integrated)

**Base URL:** `/api` (or as configured)

**Authentication:** All endpoints require JWT authentication unless otherwise specified.

---

## Table of Contents

1. [Exam CRUD Operations](#1-exam-crud-operations)
2. [Exam Scheduling](#2-exam-scheduling)
3. [Exam Taking & Sessions](#3-exam-taking--sessions)
4. [Exam Submissions & Grading](#4-exam-submissions--grading)
5. [Student Exam Grades](#5-student-exam-grades)
6. [Exam Questions & Sections](#6-exam-questions--sections)
7. [Exam Analytics](#7-exam-analytics)
8. [Exam Publishing & Status](#8-exam-publishing--status)
9. [Integration with Existing Endpoints](#9-integration-with-existing-endpoints)

---

## 1. Exam CRUD Operations

### 1.1 Get Exams (List/Filter)

**Endpoint:** `GET /exams`

**Description:** Retrieve a list of exams with optional filtering and pagination.

**Authentication:** Required (Admin, Instructor, Student - filtered by role)

**Query Parameters:**
```typescript
{
  fieldId?: string;           // Filter by field
  courseId?: string;           // Filter by course
  instructorId?: string;       // Filter by instructor
  status?: string;             // 'draft' | 'scheduled' | 'active' | 'completed' | 'archived'
  search?: string;             // Search in title/description
  page?: number;              // Page number (default: 1)
  limit?: number;             // Items per page (default: 20)
  sortBy?: string;            // 'createdAt' | 'title' | 'scheduledDate'
  sortOrder?: 'asc' | 'desc'; // Sort order (default: 'desc')
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "courseId": "string",
        "fieldId": "string",
        "instructorId": "string",
        "scheduledDate": "2024-01-15T10:00:00Z",
        "scheduledEndDate": "2024-01-15T12:00:00Z",
        "duration": 120,
        "totalPoints": 100,
        "passingScore": 60,
        "maxAttempts": 1,
        "questionCount": 25,
        "status": "scheduled",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

### 1.2 Get Exam by ID

**Endpoint:** `GET /exams/:examId`

**Description:** Retrieve detailed information about a specific exam.

**Authentication:** Required (Admin, Instructor with access, Student if enrolled)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "courseId": "string",
    "fieldId": "string",
    "instructorId": "string",
    "scheduledDate": "2024-01-15T10:00:00Z",
    "scheduledEndDate": "2024-01-15T12:00:00Z",
    "duration": 120,
    "totalPoints": 100,
    "passingScore": 60,
    "maxAttempts": 1,
    "shuffleQuestions": false,
    "shuffleAnswers": false,
    "showResultsImmediately": false,
    "allowLateSubmission": false,
    "sections": [
      {
        "id": "string",
        "title": "string",
        "questions": [
          {
            "id": "string",
            "question": "string",
            "type": "multiple-choice",
            "options": ["string"],
            "correctAnswer": 0,
            "points": 4,
            "difficulty": "medium",
            "order": 1
          }
        ],
        "points": 100,
        "order": 1
      }
    ],
    "questionCount": 25,
    "status": "scheduled",
    "instructions": "string",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Exam not found
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

### 1.3 Create Exam

**Endpoint:** `POST /exams`

**Description:** Create a new exam (from AI generation or manual creation).

**Authentication:** Required (Admin, Instructor)

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "courseId": "string (required)",
  "fieldId": "string (required)",
  "duration": 120,
  "totalPoints": 100,
  "passingScore": 60,
  "maxAttempts": 1,
  "scheduledDate": "2024-01-15T10:00:00Z",
  "scheduledEndDate": "2024-01-15T12:00:00Z",
  "sections": [
    {
      "id": "string",
      "title": "string",
      "questions": [
        {
          "id": "string",
          "question": "string",
          "type": "multiple-choice",
          "options": ["string"],
          "correctAnswer": 0,
          "explanation": "string",
          "points": 4,
          "difficulty": "medium",
          "order": 1
        }
      ],
      "points": 100,
      "order": 1
    }
  ],
  "settings": {
    "shuffleQuestions": false,
    "shuffleAnswers": false,
    "showResultsImmediately": false,
    "allowLateSubmission": false
  },
  "instructions": "string",
  "status": "draft"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "courseId": "string",
    "fieldId": "string",
    "instructorId": "string",
    "duration": 120,
    "totalPoints": 100,
    "questionCount": 25,
    "status": "draft",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "creditsUsed": 0
}
```

**Status Codes:**
- `201 Created` - Exam created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Course or field not found

---

### 1.4 Update Exam

**Endpoint:** `PUT /exams/:examId` or `PATCH /exams/:examId`

**Description:** Update an existing exam. Use PATCH for partial updates.

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Request Body:** (All fields optional for PATCH, required fields for PUT)
```json
{
  "title": "string",
  "description": "string",
  "duration": 120,
  "totalPoints": 100,
  "passingScore": 60,
  "maxAttempts": 1,
  "sections": [],
  "settings": {},
  "instructions": "string",
  "status": "draft"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Exam updated successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

### 1.5 Delete Exam

**Endpoint:** `DELETE /exams/:examId`

**Description:** Delete an exam. Only allowed if exam has no submissions.

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Response:**
```json
{
  "success": true,
  "message": "Exam deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Exam deleted successfully
- `400 Bad Request` - Exam has submissions, cannot delete
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

### 1.6 Duplicate Exam

**Endpoint:** `POST /exams/:examId/duplicate`

**Description:** Create a copy of an existing exam.

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID to duplicate

**Request Body:**
```json
{
  "title": "string (optional - defaults to 'Copy of {original title}')"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "status": "draft",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `201 Created` - Exam duplicated successfully
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

## 2. Exam Scheduling

### 2.1 Schedule Exam

**Endpoint:** `POST /exams/:examId/schedule`

**Description:** Schedule an exam for a specific date and time.

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Request Body:**
```json
{
  "scheduledDate": "2024-01-15T10:00:00Z (required, ISO 8601)",
  "scheduledEndDate": "2024-01-15T12:00:00Z (optional, ISO 8601)",
  "duration": 120
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "scheduledDate": "2024-01-15T10:00:00Z",
    "scheduledEndDate": "2024-01-15T12:00:00Z",
    "status": "scheduled",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Exam scheduled successfully
- `400 Bad Request` - Invalid date or exam already scheduled
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

### 2.2 Update Exam Schedule

**Endpoint:** `PATCH /exams/:examId/schedule`

**Description:** Update the schedule of an existing exam.

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Request Body:** (All fields optional)
```json
{
  "scheduledDate": "2024-01-15T10:00:00Z",
  "scheduledEndDate": "2024-01-15T12:00:00Z",
  "duration": 120
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "scheduledDate": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Schedule updated successfully
- `400 Bad Request` - Invalid date
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

### 2.3 Cancel Scheduled Exam

**Endpoint:** `DELETE /exams/:examId/schedule`

**Description:** Cancel a scheduled exam (changes status to 'draft').

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "scheduledDate": null,
    "status": "draft",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Schedule cancelled successfully
- `400 Bad Request` - Exam has active sessions or submissions
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

### 2.4 Get Upcoming Exams (Student)

**Endpoint:** `GET /exams/upcoming`

**Description:** Get list of upcoming exams for the authenticated student.

**Authentication:** Required (Student)

**Query Parameters:**
```typescript
{
  courseId?: string;    // Filter by course
  daysAhead?: number;   // Days to look ahead (default: 30)
  page?: number;        // Page number
  limit?: number;       // Items per page
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "string",
        "title": "string",
        "courseId": "string",
        "courseName": "string",
        "scheduledDate": "2024-01-15T10:00:00Z",
        "duration": 120,
        "questionCount": 25,
        "totalPoints": 100,
        "timeUntil": 86400
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

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token

---

### 2.5 Get Scheduled Exams (Instructor)

**Endpoint:** `GET /exams/scheduled`

**Description:** Get list of scheduled exams for the authenticated instructor.

**Authentication:** Required (Instructor, Admin)

**Query Parameters:**
```typescript
{
  fieldId?: string;     // Filter by field
  courseId?: string;    // Filter by course
  status?: string;      // 'scheduled' | 'active'
  fromDate?: string;    // ISO date
  toDate?: string;      // ISO date
  page?: number;
  limit?: number;
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "string",
        "title": "string",
        "courseId": "string",
        "scheduledDate": "2024-01-15T10:00:00Z",
        "submissionCount": 15,
        "status": "scheduled"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token

---

## 3. Exam Taking & Sessions

### 3.1 Start Exam (Student)

**Endpoint:** `POST /exams/:examId/start`

**Description:** Start an exam session for a student. Creates a session and returns exam details.

**Authentication:** Required (Student)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "string",
      "examId": "string",
      "studentId": "string",
      "startedAt": "2024-01-15T10:00:00Z",
      "expiresAt": "2024-01-15T12:00:00Z",
      "timeRemaining": 7200
    },
    "exam": {
      "id": "string",
      "title": "string",
      "duration": 120,
      "sections": [
        {
          "id": "string",
          "title": "string",
          "questions": [
            {
              "id": "string",
              "question": "string",
              "type": "multiple-choice",
              "options": ["string"],
              "points": 4,
              "order": 1
            }
          ],
          "order": 1
        }
      ]
    }
  }
}
```

**Status Codes:**
- `201 Created` - Session created successfully
- `400 Bad Request` - Exam not available, max attempts reached, or exam not scheduled
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Student not enrolled in course
- `404 Not Found` - Exam not found

---

### 3.2 Save Exam Progress (Auto-save)

**Endpoint:** `PUT /exams/:examId/sessions/:sessionId`

**Description:** Save exam progress during attempt (auto-save functionality).

**Authentication:** Required (Student - must own session)

**URL Parameters:**
- `examId` (string, required) - Exam ID
- `sessionId` (string, required) - Session ID

**Request Body:**
```json
{
  "answers": {
    "questionId1": "answer1",
    "questionId2": 0,
    "questionId3": "essay answer text"
  },
  "currentQuestionIndex": 5,
  "timeRemaining": 3600
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "string",
      "timeRemaining": 3600,
      "lastSavedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Status Codes:**
- `200 OK` - Progress saved successfully
- `400 Bad Request` - Session expired or invalid
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not session owner
- `404 Not Found` - Session not found

---

### 3.3 Submit Exam (Student)

**Endpoint:** `POST /exams/:examId/submit`

**Description:** Submit completed exam for grading.

**Authentication:** Required (Student - must own session)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Request Body:**
```json
{
  "sessionId": "string (required)",
  "answers": {
    "questionId1": "answer1",
    "questionId2": 0,
    "questionId3": "essay answer text"
  },
  "submittedAt": "2024-01-15T11:45:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submission": {
      "id": "string",
      "examId": "string",
      "studentId": "string",
      "sessionId": "string",
      "startedAt": "2024-01-15T10:00:00Z",
      "submittedAt": "2024-01-15T11:45:00Z",
      "answers": {},
      "status": "submitted",
      "score": null,
      "grade": null
    },
    "grade": {
      "id": "string",
      "totalScore": 85,
      "maxScore": 100,
      "percentage": 85,
      "letterGrade": "B",
      "gradingMethod": "auto"
    }
  }
}
```

**Note:** If `showResultsImmediately` is true and all questions are auto-gradable, grade is included. Otherwise, grade will be null until manual/AI grading.

**Status Codes:**
- `200 OK` - Exam submitted successfully
- `400 Bad Request` - Session expired, invalid answers, or already submitted
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not session owner
- `404 Not Found` - Exam or session not found

---

### 3.4 Get Exam Session Status

**Endpoint:** `GET /exams/:examId/sessions/:sessionId`

**Description:** Get current status of an exam session.

**Authentication:** Required (Student - must own session, or Instructor/Admin)

**URL Parameters:**
- `examId` (string, required) - Exam ID
- `sessionId` (string, required) - Session ID

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "string",
      "examId": "string",
      "studentId": "string",
      "startedAt": "2024-01-15T10:00:00Z",
      "expiresAt": "2024-01-15T12:00:00Z",
      "timeRemaining": 3600
    },
    "exam": {
      "id": "string",
      "title": "string",
      "duration": 120
    },
    "submission": {
      "id": "string",
      "status": "submitted",
      "submittedAt": "2024-01-15T11:45:00Z"
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Session not found

---

### 3.5 Extend Exam Time (Admin/Instructor)

**Endpoint:** `POST /exams/:examId/sessions/:sessionId/extend`

**Description:** Extend exam time for a student (special circumstances).

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID
- `sessionId` (string, required) - Session ID

**Request Body:**
```json
{
  "additionalMinutes": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "string",
      "expiresAt": "2024-01-15T12:30:00Z",
      "timeRemaining": 5400
    }
  }
}
```

**Status Codes:**
- `200 OK` - Time extended successfully
- `400 Bad Request` - Session already expired or submitted
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Session not found

---

## 4. Exam Submissions & Grading

### 4.1 Get Exam Submissions (Instructor)

**Endpoint:** `GET /exams/:examId/submissions`

**Description:** Get all submissions for an exam.

**Authentication:** Required (Instructor with access, Admin)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Query Parameters:**
```typescript
{
  status?: string;      // 'submitted' | 'graded' | 'in-progress'
  studentId?: string;   // Filter by student
  page?: number;
  limit?: number;
  sortBy?: string;      // 'submittedAt' | 'score' | 'studentName'
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "string",
        "examId": "string",
        "studentId": "string",
        "studentName": "string",
        "startedAt": "2024-01-15T10:00:00Z",
        "submittedAt": "2024-01-15T11:45:00Z",
        "status": "submitted",
        "score": null,
        "grade": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

### 4.2 Get Submission Details

**Endpoint:** `GET /exams/:examId/submissions/:submissionId`

**Description:** Get detailed information about a specific submission.

**Authentication:** Required (Instructor with access, Admin, Student - own submission)

**URL Parameters:**
- `examId` (string, required) - Exam ID
- `submissionId` (string, required) - Submission ID

**Response:**
```json
{
  "success": true,
  "data": {
    "submission": {
      "id": "string",
      "examId": "string",
      "studentId": "string",
      "sessionId": "string",
      "startedAt": "2024-01-15T10:00:00Z",
      "submittedAt": "2024-01-15T11:45:00Z",
      "answers": {
        "questionId1": "answer1",
        "questionId2": 0
      },
      "status": "submitted",
      "score": null,
      "grade": null
    },
    "exam": {
      "id": "string",
      "title": "string",
      "sections": []
    },
    "student": {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Submission not found

---

### 4.3 Grade Submission with AI (Essay Questions)

**Endpoint:** `POST /exam-submissions/:submissionId/ai-grade`

**Description:** Grade essay questions in a submission using AI (integrates with existing `/ai/grade-essay` endpoint).

**Authentication:** Required (Instructor with access, Admin)

**URL Parameters:**
- `submissionId` (string, required) - Submission ID

**Request Body:**
```json
{
  "rubric": "string (optional)",
  "maxScore": 100,
  "criteria": {
    "structure": 25,
    "content": 35,
    "grammar": 20,
    "originality": 20
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "grade": {
      "id": "string",
      "submissionId": "string",
      "examId": "string",
      "studentId": "string",
      "totalScore": 85,
      "maxScore": 100,
      "percentage": 85,
      "letterGrade": "B",
      "questionGrades": [
        {
          "questionId": "string",
          "pointsAwarded": 8,
          "maxPoints": 10,
          "feedback": "string"
        }
      ],
      "overallFeedback": "string",
      "gradedAt": "2024-01-15T12:00:00Z",
      "gradedBy": "string",
      "gradingMethod": "ai"
    },
    "creditsUsed": 5
  }
}
```

**Status Codes:**
- `200 OK` - Grading completed successfully
- `400 Bad Request` - No essay questions in submission or invalid request
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Submission not found
- `402 Payment Required` - Insufficient AI credits

**Note:** This endpoint internally calls `/ai/grade-essay` for each essay question.

---

### 4.4 Grade Submission Manually

**Endpoint:** `POST /exam-submissions/:submissionId/grade`

**Description:** Manually grade a submission (for essay questions or review).

**Authentication:** Required (Instructor with access, Admin)

**URL Parameters:**
- `submissionId` (string, required) - Submission ID

**Request Body:**
```json
{
  "questionGrades": {
    "questionId1": {
      "pointsAwarded": 8,
      "maxPoints": 10,
      "feedback": "Good answer, but could be more detailed."
    },
    "questionId2": {
      "pointsAwarded": 5,
      "maxPoints": 10,
      "feedback": "Missing key points."
    }
  },
  "overallFeedback": "Overall good performance.",
  "isGraded": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "grade": {
      "id": "string",
      "submissionId": "string",
      "totalScore": 85,
      "maxScore": 100,
      "percentage": 85,
      "letterGrade": "B",
      "questionGrades": [],
      "overallFeedback": "string",
      "gradedAt": "2024-01-15T12:00:00Z",
      "gradedBy": "string",
      "gradingMethod": "manual"
    }
  }
}
```

**Status Codes:**
- `200 OK` - Grading completed successfully
- `400 Bad Request` - Invalid grades or submission already graded
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Submission not found

---

### 4.5 Auto-Grade Submission (Multiple Choice/True-False)

**Endpoint:** `POST /exam-submissions/:submissionId/auto-grade`

**Description:** Automatically grade multiple-choice and true-false questions.

**Authentication:** Required (Instructor with access, Admin)

**URL Parameters:**
- `submissionId` (string, required) - Submission ID

**Response:**
```json
{
  "success": true,
  "data": {
    "grade": {
      "id": "string",
      "submissionId": "string",
      "totalScore": 75,
      "maxScore": 100,
      "percentage": 75,
      "letterGrade": "C",
      "questionGrades": [],
      "gradedAt": "2024-01-15T12:00:00Z",
      "gradingMethod": "auto"
    },
    "gradedQuestions": 20,
    "manualReviewRequired": 5
  }
}
```

**Status Codes:**
- `200 OK` - Auto-grading completed
- `400 Bad Request` - Submission already graded
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Submission not found

---

### 4.6 Update Submission Grade

**Endpoint:** `PATCH /exam-submissions/:submissionId/grade`

**Description:** Update an existing grade (for corrections or adjustments).

**Authentication:** Required (Instructor with access, Admin)

**URL Parameters:**
- `submissionId` (string, required) - Submission ID

**Request Body:** (All fields optional)
```json
{
  "questionGrades": {
    "questionId1": {
      "pointsAwarded": 9,
      "feedback": "Updated feedback"
    }
  },
  "overallFeedback": "Updated overall feedback"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "grade": {
      "id": "string",
      "totalScore": 90,
      "updatedAt": "2024-01-15T13:00:00Z"
    }
  }
}
```

**Status Codes:**
- `200 OK` - Grade updated successfully
- `400 Bad Request` - Invalid grade data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Submission or grade not found

---

### 4.7 Bulk Grade Submissions

**Endpoint:** `POST /exams/:examId/submissions/bulk-grade`

**Description:** Grade multiple submissions at once (auto, AI, or manual).

**Authentication:** Required (Instructor with access, Admin)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Request Body:**
```json
{
  "submissionIds": ["string"],
  "gradeMethod": "auto",
  "rubric": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "graded": 20,
    "failed": 2,
    "results": [
      {
        "submissionId": "string",
        "success": true,
        "grade": {
          "id": "string",
          "totalScore": 85
        }
      },
      {
        "submissionId": "string",
        "success": false,
        "error": "Submission already graded"
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Bulk grading completed
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

## 5. Student Exam Grades

### 5.1 Get Student Exam Grades

**Endpoint:** `GET /exams/grades`

**Description:** Get all exam grades for the authenticated student.

**Authentication:** Required (Student)

**Query Parameters:**
```typescript
{
  examId?: string;      // Filter by exam
  courseId?: string;    // Filter by course
  status?: string;      // 'graded' | 'pending'
  page?: number;
  limit?: number;
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "grades": [
      {
        "id": "string",
        "examId": "string",
        "examTitle": "string",
        "courseId": "string",
        "courseName": "string",
        "totalScore": 85,
        "maxScore": 100,
        "percentage": 85,
        "letterGrade": "B",
        "gradedAt": "2024-01-15T12:00:00Z",
        "status": "graded"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token

---

### 5.2 Get Exam Grade Details

**Endpoint:** `GET /exams/:examId/grades/:gradeId`

**Description:** Get detailed grade information including feedback.

**Authentication:** Required (Student - own grade, Instructor with access, Admin)

**URL Parameters:**
- `examId` (string, required) - Exam ID
- `gradeId` (string, required) - Grade ID

**Response:**
```json
{
  "success": true,
  "data": {
    "grade": {
      "id": "string",
      "submissionId": "string",
      "examId": "string",
      "studentId": "string",
      "totalScore": 85,
      "maxScore": 100,
      "percentage": 85,
      "letterGrade": "B",
      "questionGrades": [
        {
          "questionId": "string",
          "question": "string",
          "pointsAwarded": 8,
          "maxPoints": 10,
          "feedback": "string",
          "correctAnswer": "string",
          "studentAnswer": "string"
        }
      ],
      "overallFeedback": "string",
      "gradedAt": "2024-01-15T12:00:00Z",
      "gradingMethod": "auto"
    },
    "exam": {
      "id": "string",
      "title": "string"
    },
    "submission": {
      "id": "string",
      "submittedAt": "2024-01-15T11:45:00Z"
    },
    "detailedFeedback": {
      "strengths": ["string"],
      "weaknesses": ["string"],
      "suggestions": ["string"]
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Grade not found

---

### 5.3 Get Student Exam Attempts

**Endpoint:** `GET /exams/:examId/attempts`

**Description:** Get all attempts for an exam by a student (defaults to current user).

**Authentication:** Required (Student, Instructor with access, Admin)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Query Parameters:**
```typescript
{
  studentId?: string;   // Defaults to current user
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "submission": {
          "id": "string",
          "startedAt": "2024-01-15T10:00:00Z",
          "submittedAt": "2024-01-15T11:45:00Z",
          "status": "graded"
        },
        "grade": {
          "id": "string",
          "totalScore": 85,
          "percentage": 85,
          "letterGrade": "B"
        },
        "attemptNumber": 1
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

## 6. Exam Questions & Sections

### 6.1 Get Exam Questions

**Endpoint:** `GET /exams/:examId/questions`

**Description:** Get all questions organized by sections for an exam.

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Response:**
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "id": "string",
        "title": "string",
        "questions": [
          {
            "id": "string",
            "question": "string",
            "type": "multiple-choice",
            "options": ["string"],
            "correctAnswer": 0,
            "explanation": "string",
            "points": 4,
            "difficulty": "medium",
            "order": 1
          }
        ],
        "points": 100,
        "order": 1
      }
    ],
    "totalQuestions": 25,
    "totalPoints": 100
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

### 6.2 Add Question to Exam

**Endpoint:** `POST /exams/:examId/questions`

**Description:** Add a question to an exam (to a specific section or default section).

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Request Body:**
```json
{
  "sectionId": "string (optional)",
  "question": {
    "id": "string",
    "question": "string",
    "type": "multiple-choice",
    "options": ["string"],
    "correctAnswer": 0,
    "explanation": "string",
    "points": 4,
    "difficulty": "medium",
    "order": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": {
      "id": "string",
      "question": "string",
      "type": "multiple-choice",
      "points": 4
    },
    "exam": {
      "id": "string",
      "questionCount": 26,
      "totalPoints": 104
    }
  }
}
```

**Status Codes:**
- `201 Created` - Question added successfully
- `400 Bad Request` - Invalid question data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam or section not found

---

### 6.3 Update Exam Question

**Endpoint:** `PUT /exams/:examId/questions/:questionId`

**Description:** Update an existing question in an exam.

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID
- `questionId` (string, required) - Question ID

**Request Body:**
```json
{
  "question": "string",
  "type": "multiple-choice",
  "options": ["string"],
  "correctAnswer": 0,
  "explanation": "string",
  "points": 4,
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": {
      "id": "string",
      "question": "string",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Status Codes:**
- `200 OK` - Question updated successfully
- `400 Bad Request` - Invalid question data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Question not found

---

### 6.4 Delete Exam Question

**Endpoint:** `DELETE /exams/:examId/questions/:questionId`

**Description:** Delete a question from an exam.

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID
- `questionId` (string, required) - Question ID

**Response:**
```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Question deleted successfully
- `400 Bad Request` - Exam has submissions, cannot modify
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Question not found

---

### 6.5 Reorder Exam Questions

**Endpoint:** `PUT /exams/:examId/questions/reorder`

**Description:** Reorder questions within an exam.

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Request Body:**
```json
{
  "questionIds": ["questionId1", "questionId2", "questionId3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exam": {
      "id": "string",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Status Codes:**
- `200 OK` - Questions reordered successfully
- `400 Bad Request` - Invalid question IDs
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

### 6.6 Add Section to Exam

**Endpoint:** `POST /exams/:examId/sections`

**Description:** Add a new section to an exam.

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Request Body:**
```json
{
  "title": "string",
  "order": 1,
  "questions": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "section": {
      "id": "string",
      "title": "string",
      "questions": [],
      "points": 0,
      "order": 1
    },
    "exam": {
      "id": "string"
    }
  }
}
```

**Status Codes:**
- `201 Created` - Section added successfully
- `400 Bad Request` - Invalid section data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

### 6.7 Update Exam Section

**Endpoint:** `PUT /exams/:examId/sections/:sectionId`

**Description:** Update an existing section in an exam.

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID
- `sectionId` (string, required) - Section ID

**Request Body:**
```json
{
  "title": "string",
  "order": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "section": {
      "id": "string",
      "title": "string",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Status Codes:**
- `200 OK` - Section updated successfully
- `400 Bad Request` - Invalid section data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Section not found

---

### 6.8 Delete Exam Section

**Endpoint:** `DELETE /exams/:examId/sections/:sectionId`

**Description:** Delete a section from an exam (questions are moved to default section or deleted).

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID
- `sectionId` (string, required) - Section ID

**Request Body:**
```json
{
  "moveQuestionsToSectionId": "string (optional - if not provided, questions are deleted)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Section deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Section deleted successfully
- `400 Bad Request` - Exam has submissions, cannot modify
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Section not found

---

## 7. Exam Analytics

### 7.1 Get Exam Analytics

**Endpoint:** `GET /exams/:examId/analytics`

**Description:** Get comprehensive analytics for an exam.

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Query Parameters:**
```typescript
{
  timeRange?: string;   // '7d' | '30d' | '90d' | 'all'
  groupBy?: string;     // 'day' | 'week' | 'month'
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "examId": "string",
    "totalSubmissions": 50,
    "averageScore": 78.5,
    "passingRate": 85,
    "completionRate": 95,
    "averageTimeSpent": 105,
    "questionStatistics": [
      {
        "questionId": "string",
        "correctAnswers": 40,
        "incorrectAnswers": 10,
        "averageTimeSpent": 2.5,
        "difficultyRating": 0.8
      }
    ],
    "scoreDistribution": {
      "excellent": 15,
      "good": 20,
      "satisfactory": 10,
      "needsImprovement": 5
    },
    "submissionTrends": [
      {
        "date": "2024-01-15",
        "count": 10,
        "averageScore": 80
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

### 7.2 Get Student Exam Statistics

**Endpoint:** `GET /exams/statistics`

**Description:** Get exam statistics for the authenticated student.

**Authentication:** Required (Student)

**Query Parameters:**
```typescript
{
  courseId?: string;     // Filter by course
  timeRange?: string;   // '7d' | '30d' | '90d' | 'all'
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalExams": 10,
    "completedExams": 8,
    "averageScore": 82.5,
    "bestScore": 95,
    "worstScore": 65,
    "examsByStatus": {
      "scheduled": 2,
      "completed": 8,
      "graded": 7
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token

---

### 7.3 Export Exam Results

**Endpoint:** `GET /exams/:examId/export`

**Description:** Export exam results in various formats.

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Query Parameters:**
```typescript
{
  format?: string;            // 'csv' | 'excel' | 'pdf'
  includeAnswers?: boolean;   // Include student answers
  includeFeedback?: boolean;  // Include grading feedback
}
```

**Response:** File download (Blob)

**Content-Type:**
- CSV: `text/csv`
- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- PDF: `application/pdf`

**Status Codes:**
- `200 OK` - File generated successfully
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

## 8. Exam Publishing & Status

### 8.1 Publish Exam

**Endpoint:** `POST /exams/:examId/publish`

**Description:** Publish an exam (makes it available to students if scheduled).

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "scheduled",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Exam published successfully
- `400 Bad Request` - Exam not ready (missing questions, not scheduled, etc.)
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

### 8.2 Unpublish Exam

**Endpoint:** `POST /exams/:examId/unpublish`

**Description:** Unpublish an exam (changes status to 'draft').

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "draft",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Exam unpublished successfully
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

### 8.3 Archive Exam

**Endpoint:** `POST /exams/:examId/archive`

**Description:** Archive an exam (changes status to 'archived', hides from active lists).

**Authentication:** Required (Admin, Instructor with access)

**URL Parameters:**
- `examId` (string, required) - Exam ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "archived",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Exam archived successfully
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Exam not found

---

## 9. Integration with Existing Endpoints

### 9.1 AI Exam Generation (Already Integrated)

**Endpoint:** `POST /ai/generate-exam`

**Status:** ✅ Already implemented in frontend

**Usage:** Frontend calls this endpoint, then uses the generated exam to create an exam via `POST /exams`.

**Integration Note:** When creating an exam from AI generation, the frontend will:
1. Call `/ai/generate-exam` to get exam structure
2. Call `/exams` (POST) to save the exam
3. Optionally schedule it via `/exams/:examId/schedule`

---

### 9.2 AI Essay Grading (Already Integrated)

**Endpoint:** `POST /ai/grade-essay`

**Status:** ✅ Already implemented in frontend

**Usage:** Used by `/exam-submissions/:submissionId/ai-grade` endpoint for grading essay questions.

**Integration Note:** The backend should call this endpoint internally when processing AI grading requests for exam submissions.

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., exam already scheduled)
- `INSUFFICIENT_CREDITS` - Not enough AI credits
- `SESSION_EXPIRED` - Exam session expired
- `MAX_ATTEMPTS_REACHED` - Student has reached max attempts

---

## Authentication & Authorization

### Role-Based Access

- **Admin:** Full access to all endpoints
- **Instructor:** Access to exams in their courses/fields
- **Student:** Access to own exams, submissions, and grades

### Permission Checks

- Instructors can only access exams in courses they have access to
- Students can only access exams in courses they are enrolled in
- Students can only access their own submissions and grades

---

## Data Models

### Exam Status Flow

```
draft → scheduled → active → completed → archived
         ↓
      (can cancel back to draft)
```

### Submission Status Flow

```
in-progress → submitted → graded
```

### Question Types

- `multiple-choice` - Single correct answer from options
- `true-false` - Boolean answer
- `essay` - Free-form text answer (requires manual/AI grading)
- `short-answer` - Short text answer (can be auto-graded with fuzzy matching)

---

## Notes for Backend Implementation

1. **Scheduling:** Exams must be scheduled before students can start them
2. **Time Management:** Track time remaining in sessions, auto-submit on expiry
3. **Auto-grading:** Multiple-choice and true-false should be auto-graded immediately
4. **AI Grading:** Essay questions require AI or manual grading
5. **Progress Saving:** Implement auto-save for exam sessions
6. **Notifications:** Send notifications when exams are scheduled, submitted, or graded
7. **Validation:** Ensure exam has questions before publishing
8. **Attempts:** Enforce max attempts limit per student
9. **Late Submission:** Handle late submissions based on `allowLateSubmission` setting
10. **Shuffling:** Implement question and answer shuffling based on exam settings

---

## Implementation Priority

**Phase 1 (Critical):**
- Exam CRUD operations
- Basic scheduling
- Start exam session
- Submit exam
- Auto-grading

**Phase 2 (High Priority):**
- Manual grading
- AI grading integration
- Student grades retrieval
- Question/Section management

**Phase 3 (Medium Priority):**
- Analytics
- Export functionality
- Bulk operations
- Advanced scheduling features

---

This specification should be implemented progressively as the frontend requires each endpoint. The frontend will handle graceful degradation if endpoints are not yet available.

