# Backend Question Bank Endpoints Specification

## Overview

This document specifies all API endpoints required for the Question Bank Management System. The frontend will implement these endpoints progressively, and the backend should create them as they are needed.

**Total Endpoints:** 15 new endpoints

**Base URL:** `/api` (or as configured)

**Authentication:** All endpoints require JWT authentication unless otherwise specified.

---

## Table of Contents

1. [Question CRUD Operations](#1-question-crud-operations)
2. [Question Bank Hierarchy](#2-question-bank-hierarchy)
3. [Question Search & Filtering](#3-question-search--filtering)
4. [Question Statistics](#4-question-statistics)
5. [Question Import/Export](#5-question-importexport)
6. [Integration with AI Generation](#6-integration-with-ai-generation)
7. [Integration with Exams](#7-integration-with-exams)

---

## 1. Question CRUD Operations

### 1.1 Get Questions (List/Filter)

**Endpoint:** `GET /questions`

**Description:** Retrieve a list of questions from the question bank with optional filtering and pagination.

**Authentication:** Required (Admin, Instructor)

**Query Parameters:**
```typescript
{
  fieldId?: string;           // Filter by field
  courseId?: string;          // Filter by course
  lessonId?: string;          // Filter by lesson
  type?: string;              // 'multiple-choice' | 'true-false' | 'essay' | 'short-answer'
  difficulty?: string;        // 'easy' | 'medium' | 'hard'
  tags?: string[];            // Filter by tags (comma-separated)
  search?: string;            // Search in question text
  source?: string;            // 'ai-generated' | 'manual' | 'exam'
  isActive?: boolean;         // Filter by active status
  page?: number;              // Page number (default: 1)
  limit?: number;             // Items per page (default: 20)
  sortBy?: string;            // 'createdAt' | 'updatedAt' | 'usageCount' | 'difficulty'
  sortOrder?: 'asc' | 'desc'; // Sort order (default: 'desc')
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "string",
        "question": "string",
        "type": "multiple-choice",
        "options": ["string"],
        "correctAnswer": 0,
        "explanation": "string",
        "difficulty": "medium",
        "points": 4,
        "fieldId": "string",
        "fieldName": "string",
        "courseId": "string",
        "courseName": "string",
        "lessonId": "string",
        "lessonName": "string",
        "tags": ["string"],
        "subject": "string",
        "source": "ai-generated",
        "usageCount": 5,
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

### 1.2 Get Question by ID

**Endpoint:** `GET /questions/:questionId`

**Description:** Retrieve detailed information about a specific question.

**Authentication:** Required (Admin, Instructor)

**URL Parameters:**
- `questionId` (string, required) - Question ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "question": "string",
    "type": "multiple-choice",
    "options": ["string"],
    "correctAnswer": 0,
    "explanation": "string",
    "difficulty": "medium",
    "points": 4,
    "fieldId": "string",
    "fieldName": "string",
    "courseId": "string",
    "courseName": "string",
    "lessonId": "string",
    "lessonName": "string",
    "tags": ["string"],
    "subject": "string",
    "source": "ai-generated",
    "usageCount": 5,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Question not found
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

### 1.3 Create Question

**Endpoint:** `POST /questions`

**Description:** Create a new question in the question bank.

**Authentication:** Required (Admin, Instructor)

**Request Body:**
```json
{
  "question": "string",
  "type": "multiple-choice",
  "options": ["string"],
  "correctAnswer": 0,
  "explanation": "string",
  "difficulty": "easy",
  "points": 4,
  "fieldId": "string",
  "courseId": "string",
  "lessonId": "string",
  "tags": ["string"],
  "subject": "string",
  "source": "manual"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "question": "string",
    "type": "multiple-choice",
    "options": ["string"],
    "correctAnswer": 0,
    "explanation": "string",
    "difficulty": "medium",
    "points": 4,
    "fieldId": "string",
    "fieldName": "string",
    "courseId": "string",
    "courseName": "string",
    "lessonId": "string",
    "lessonName": "string",
    "tags": ["string"],
    "subject": "string",
    "source": "manual",
    "usageCount": 0,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes:**
- `201 Created` - Question created successfully
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

### 1.4 Update Question

**Endpoint:** `PUT /questions/:questionId`

**Description:** Update an existing question in the question bank.

**Authentication:** Required (Admin, Instructor - must own or have access)

**URL Parameters:**
- `questionId` (string, required) - Question ID

**Request Body:**
```json
{
  "question": "string",
  "type": "multiple-choice",
  "options": ["string"],
  "correctAnswer": 0,
  "explanation": "string",
  "difficulty": "easy",
  "points": 4,
  "fieldId": "string",
  "courseId": "string",
  "lessonId": "string",
  "tags": ["string"],
  "subject": "string",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "question": "string",
    "type": "multiple-choice",
    "options": ["string"],
    "correctAnswer": 0,
    "explanation": "string",
    "difficulty": "medium",
    "points": 4,
    "fieldId": "string",
    "fieldName": "string",
    "courseId": "string",
    "courseName": "string",
    "lessonId": "string",
    "lessonName": "string",
    "tags": ["string"],
    "subject": "string",
    "source": "manual",
    "usageCount": 5,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Question updated successfully
- `400 Bad Request` - Invalid input data
- `404 Not Found` - Question not found
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions or access

---

### 1.5 Delete Question

**Endpoint:** `DELETE /questions/:questionId`

**Description:** Delete (soft delete) a question from the question bank.

**Authentication:** Required (Admin, Instructor - must own or have access)

**URL Parameters:**
- `questionId` (string, required) - Question ID

**Query Parameters:**
```typescript
{
  hardDelete?: boolean;  // If true, permanently delete (Admin only)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Question deleted successfully
- `404 Not Found` - Question not found
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions or access
- `409 Conflict` - Question is in use (cannot delete)

---

### 1.6 Bulk Delete Questions

**Endpoint:** `DELETE /questions/bulk`

**Description:** Delete multiple questions from the question bank.

**Authentication:** Required (Admin, Instructor)

**Request Body:**
```json
{
  "questionIds": ["string"],
  "hardDelete": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": 5,
    "failed": 0,
    "skipped": 2
  },
  "message": "Bulk delete completed"
}
```

**Status Codes:**
- `200 OK` - Bulk delete completed (partial success allowed)
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

## 2. Question Bank Hierarchy

### 2.1 Get Question Bank Hierarchy (Primary Endpoint)

**Endpoint:** `GET /questions/hierarchy`

**Description:** Retrieve the complete question bank hierarchy organized by Field → Course → Questions with counts. This is the primary endpoint for hierarchical navigation in the question bank.

**Authentication:** Required (Admin, Instructor)

**Query Parameters:**
```typescript
{
  includeQuestions?: boolean;    // If true, include question details (default: false)
  includeInactive?: boolean;     // If true, include inactive questions (default: false)
  fieldId?: string;              // Filter by specific field
  courseId?: string;             // Filter by specific course
  instructorId?: string;         // Filter by instructor (admin only)
  depth?: 'summary' | 'full';    // 'summary' returns only counts, 'full' includes question lists (default: 'summary')
}
```

**Response (Summary Mode - Default):**
```json
{
  "success": true,
  "data": {
    "fields": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "icon": "string",
        "questionCount": 50,
        "activeQuestionCount": 48,
        "courses": [
          {
            "id": "string",
            "name": "string",
            "fieldId": "string",
            "fieldName": "string",
            "questionCount": 25,
            "activeQuestionCount": 24,
            "breakdown": {
              "byType": {
                "multiple-choice": 15,
                "true-false": 5,
                "essay": 3,
                "short-answer": 2
              },
              "byDifficulty": {
                "easy": 8,
                "medium": 12,
                "hard": 5
              },
              "bySource": {
                "ai-generated": 15,
                "manual": 10
              }
            }
          }
        ]
      }
    ],
    "statistics": {
      "totalFields": 5,
      "totalCourses": 15,
      "totalQuestions": 500,
      "activeQuestions": 480,
      "archivedQuestions": 20
    }
  }
}
```

**Response (Full Mode - when `includeQuestions: true` and `depth: 'full'`):**
```json
{
  "success": true,
  "data": {
    "fields": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "icon": "string",
        "questionCount": 50,
        "activeQuestionCount": 48,
        "courses": [
          {
            "id": "string",
            "name": "string",
            "fieldId": "string",
            "fieldName": "string",
            "questionCount": 25,
            "activeQuestionCount": 24,
            "breakdown": {
              "byType": {
                "multiple-choice": 15,
                "true-false": 5,
                "essay": 3,
                "short-answer": 2
              },
              "byDifficulty": {
                "easy": 8,
                "medium": 12,
                "hard": 5
              },
              "bySource": {
                "ai-generated": 15,
                "manual": 10
              }
            },
            "questions": [
              {
                "id": "string",
                "question": "string",
                "type": "multiple-choice",
                "options": ["string"],
                "correctAnswer": 0,
                "explanation": "string",
                "difficulty": "medium",
                "points": 4,
                "tags": ["string"],
                "source": "ai-generated",
                "usageCount": 5,
                "isActive": true,
                "createdAt": "2024-01-15T10:30:00Z",
                "updatedAt": "2024-01-15T10:30:00Z"
              }
            ]
          }
        ]
      }
    ],
    "statistics": {
      "totalFields": 5,
      "totalCourses": 15,
      "totalQuestions": 500,
      "activeQuestions": 480,
      "archivedQuestions": 20
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

**Notes:**
- This is the **primary endpoint** for the Question Bank component's hierarchy view
- By default, returns only summary counts for performance (faster loading)
- Set `includeQuestions: true` and `depth: 'full'` to get full question details
- Use `fieldId` parameter to get hierarchy for a specific field only
- Use `courseId` with `fieldId` to get hierarchy for a specific course only
- Instructor access is automatically filtered to only their accessible courses

---

### 2.2 Get Fields with Question Counts (Alternative - Simpler)

**Endpoint:** `GET /questions/fields`

**Description:** Retrieve all fields with their question counts (simpler alternative if full hierarchy is not needed).

**Authentication:** Required (Admin, Instructor)

**Response:**
```json
{
  "success": true,
  "data": {
    "fields": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "icon": "string",
        "questionCount": 50,
        "activeQuestionCount": 48
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

### 2.3 Get Courses with Question Counts for Field

**Endpoint:** `GET /questions/fields/:fieldId/courses`

**Description:** Retrieve all courses in a field with their question counts.

**Authentication:** Required (Admin, Instructor)

**URL Parameters:**
- `fieldId` (string, required) - Field ID

**Response:**
```json
{
  "success": true,
  "data": {
    "field": {
      "id": "string",
      "name": "string",
      "description": "string",
      "icon": "string"
    },
    "courses": [
      {
        "id": "string",
        "name": "string",
        "fieldId": "string",
        "fieldName": "string",
        "questionCount": 25,
        "activeQuestionCount": 24,
        "breakdown": {
          "byType": {
            "multiple-choice": 15,
            "true-false": 5,
            "essay": 3,
            "short-answer": 2
          },
          "byDifficulty": {
            "easy": 8,
            "medium": 12,
            "hard": 5
          }
        }
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Field not found
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

### 2.4 Get Questions by Field and Course

**Endpoint:** `GET /questions/fields/:fieldId/courses/:courseId`

**Description:** Retrieve all questions for a specific field and course combination.

**Authentication:** Required (Admin, Instructor)

**URL Parameters:**
- `fieldId` (string, required) - Field ID
- `courseId` (string, required) - Course ID

**Query Parameters:**
```typescript
{
  lessonId?: string;
  type?: string;
  difficulty?: string;
  isActive?: boolean;
  includeInactive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;            // 'createdAt' | 'updatedAt' | 'usageCount' | 'difficulty'
  sortOrder?: 'asc' | 'desc'; // Sort order (default: 'desc')
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "field": {
      "id": "string",
      "name": "string"
    },
    "course": {
      "id": "string",
      "name": "string",
      "fieldId": "string",
      "fieldName": "string"
    },
    "questions": [
      {
        "id": "string",
        "question": "string",
        "type": "multiple-choice",
        "options": ["string"],
        "correctAnswer": 0,
        "explanation": "string",
        "difficulty": "medium",
        "points": 4,
        "lessonId": "string",
        "lessonName": "string",
        "tags": ["string"],
        "subject": "string",
        "source": "ai-generated",
        "usageCount": 5,
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
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
- `404 Not Found` - Field or course not found
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

## 3. Question Search & Filtering

### 3.1 Advanced Search

**Endpoint:** `POST /questions/search`

**Description:** Advanced search with complex filters and query building.

**Authentication:** Required (Admin, Instructor)

**Request Body:**
```json
{
  "query": "string",
  "filters": {
    "fieldIds": ["string"],
    "courseIds": ["string"],
    "lessonIds": ["string"],
    "types": ["multiple-choice", "essay"],
    "difficulties": ["easy", "medium"],
    "tags": ["string"],
    "sources": ["ai-generated", "manual"],
    "isActive": true,
    "minUsageCount": 0,
    "maxUsageCount": 100,
    "dateRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-12-31T23:59:59Z"
    }
  },
  "sortBy": "usageCount",
  "sortOrder": "desc",
  "page": 1,
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "string",
        "question": "string",
        "type": "multiple-choice",
        "difficulty": "medium",
        "fieldName": "string",
        "courseName": "string",
        "usageCount": 5,
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "facets": {
      "types": {
        "multiple-choice": 20,
        "essay": 15,
        "true-false": 10
      },
      "difficulties": {
        "easy": 15,
        "medium": 20,
        "hard": 10
      },
      "fields": {
        "field-id-1": 25,
        "field-id-2": 20
      }
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid search parameters
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

## 4. Question Statistics

### 4.1 Get Question Bank Statistics

**Endpoint:** `GET /questions/statistics`

**Description:** Retrieve aggregated statistics about the question bank.

**Authentication:** Required (Admin, Instructor)

**Query Parameters:**
```typescript
{
  fieldId?: string;      // Filter by field
  courseId?: string;     // Filter by course
  instructorId?: string; // Filter by instructor (admin only)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalQuestions": 500,
    "activeQuestions": 480,
    "archivedQuestions": 20,
    "byType": {
      "multiple-choice": 250,
      "true-false": 100,
      "essay": 100,
      "short-answer": 50
    },
    "byDifficulty": {
      "easy": 150,
      "medium": 250,
      "hard": 100
    },
    "bySource": {
      "ai-generated": 300,
      "manual": 180,
      "exam": 20
    },
    "byField": {
      "field-id-1": 250,
      "field-id-2": 200,
      "field-id-3": 50
    },
    "mostUsed": [
      {
        "id": "string",
        "question": "string",
        "usageCount": 45
      }
    ],
    "recentlyAdded": [
      {
        "id": "string",
        "question": "string",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

## 5. Question Import/Export

### 5.1 Export Questions

**Endpoint:** `GET /questions/export`

**Description:** Export questions to CSV, JSON, or Excel format.

**Authentication:** Required (Admin, Instructor)

**Query Parameters:**
```typescript
{
  format?: 'csv' | 'json' | 'xlsx';  // Default: 'json'
  fieldId?: string;
  courseId?: string;
  questionIds?: string[];  // Comma-separated
  includeInactive?: boolean;
}
```

**Response:**
- For JSON: Returns JSON array
- For CSV/XLSX: Returns file download

**Status Codes:**
- `200 OK` - Success (file download or JSON)
- `400 Bad Request` - Invalid format or parameters
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

### 5.2 Import Questions

**Endpoint:** `POST /questions/import`

**Description:** Import questions from CSV, JSON, or Excel file.

**Authentication:** Required (Admin, Instructor)

**Request:**
- Content-Type: `multipart/form-data`
- Body: File upload

**Request Body (Form Data):**
```typescript
{
  file: File;              // Required
  fieldId: string;         // Required
  courseId: string;        // Required
  lessonId?: string;
  source: 'manual';        // Default: 'manual'
  skipDuplicates?: boolean; // Default: true
  validateOnly?: boolean;   // Default: false - if true, only validate without importing
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": 25,
    "skipped": 5,
    "failed": 2,
    "errors": [
      {
        "row": 3,
        "error": "Invalid question type"
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Import completed (partial success allowed)
- `400 Bad Request` - Invalid file format or data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

## 6. Integration with AI Generation

### 6.1 Auto-Add to Bank (Already Implemented)

**Note:** This functionality is already implemented in the AI service endpoint `/ai/generate-questions`. When `autoAddToBank: true` is set, generated questions are automatically added to the question bank.

**Endpoint:** `POST /ai/generate-questions`

**Existing Behavior:**
- When `autoAddToBank: true`, questions are automatically created in the question bank
- Questions are linked to the specified `courseId`
- Source is set to `'ai-generated'`
- Metadata like `language` is preserved

**No additional endpoint needed** - This is already functional.

---

## 7. Integration with Exams

### 7.1 Get Questions Used in Exams

**Endpoint:** `GET /questions/:questionId/exams`

**Description:** Retrieve all exams that use a specific question.

**Authentication:** Required (Admin, Instructor)

**URL Parameters:**
- `questionId` (string, required) - Question ID

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
        "status": "scheduled"
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Question not found
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

---

### 7.2 Update Question Usage Count

**Note:** This should be automatically handled by the backend when:
- A question is added to an exam
- A question is removed from an exam
- An exam is published/unpublished

**No explicit endpoint needed** - Backend should handle this automatically.

---

## Error Handling

All endpoints should follow consistent error response format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "status": 400,
    "details": {}
  }
}
```

**Common Error Codes:**
- `QUESTION_NOT_FOUND` - Question does not exist
- `INVALID_QUESTION_DATA` - Invalid input data
- `QUESTION_IN_USE` - Question cannot be deleted (used in active exams)
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `FIELD_NOT_FOUND` - Field does not exist
- `COURSE_NOT_FOUND` - Course does not exist
- `IMPORT_FAILED` - Question import failed

---

## Integration Notes

1. **Hierarchy Relationship:**
   - Questions are organized by: Field → Course → Lesson (optional)
   - Each question must belong to a Field and Course
   - Lesson is optional but recommended for better organization

2. **Question Sources:**
   - `ai-generated`: Created via AI generation endpoint
   - `manual`: Created manually by instructors/admins
   - `exam`: Migrated from an existing exam

3. **Usage Tracking:**
   - `usageCount` tracks how many exams use this question
   - Updated automatically when question is added/removed from exams
   - Used for statistics and analytics

4. **Soft Delete:**
   - Questions are soft-deleted by default (`isActive: false`)
   - Hard delete only available to admins and only if question is not in use
   - Soft-deleted questions don't appear in normal listings but remain in database

5. **Permissions:**
   - Admins: Full access to all questions
   - Instructors: Can access questions in their accessible courses
   - Students: No direct access to question bank

6. **AI Integration:**
   - The existing `/ai/generate-questions` endpoint already supports `autoAddToBank`
   - No additional endpoints needed for AI integration
   - AI-generated questions automatically link to the specified course

7. **Exam Integration:**
   - Questions from bank can be added to exams via exam endpoints
   - When adding questions to an exam, usage count is incremented
   - When removing questions from an exam, usage count is decremented

---

## Implementation Priority

**Phase 1 (Critical):**
- Question CRUD operations
- Hierarchy endpoint (primary for UI)
- Basic search and filtering

**Phase 2 (High Priority):**
- Statistics endpoint
- Field/Course-specific endpoints
- Advanced search

**Phase 3 (Medium Priority):**
- Import/Export functionality
- Bulk operations
- Question usage tracking

---

This specification should be implemented progressively as the frontend requires each endpoint. The frontend will handle graceful degradation if endpoints are not yet available.

